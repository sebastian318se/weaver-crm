using Microsoft.EntityFrameworkCore;
using TennisCrmApi;

namespace TennisCrmApiEndpoints
{
    public static class SalesEndpoints
    {
        public static IEndpointRouteBuilder MapSalesEndpoints (this IEndpointRouteBuilder app)
        {
            app.MapGet("/api/sales", GetSales);
            app.MapGet("/api/sales/{id}", GetSalesById);
            app.MapGet("api/sales/deleted", GetDeleted);

            app.MapGet("api/sales/search", GetSaleByQuery);

            app.MapPost("/api/sales/", PostSale);

            app.MapPut("/api/sales/{id}", PutSale);

            return app;
        }

        // Get all sales
        public static async Task<IResult> GetSales(AppDbContext db)
        {
            var sales = await db.Sales
                .Where(x => !x.IsDeleted)
                .Include(s => s.Customer)
                .Include(s => s.SaleItems)
                    .ThenInclude(i => i.Product)
                .ToListAsync();

            return Results.Ok(sales); 
        }

        // Get sales on ID match
        public static async Task<IResult> GetSalesById(int id, AppDbContext db)
        {
            var sale = await db.Sales
                .Include(s => s.Customer)
                .Include(s => s.SaleItems)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(x => x.OrderId == id && !x.IsDeleted);
            
            return sale is not null
                ? Results.Ok(sale)
                : Results.NotFound("Could not locate sale entry.");
        }

        // Get sales on IsDeleted == true
        public static async Task<IResult> GetDeleted(AppDbContext db)
        {
            var sale = await db.Sales
                .Where(x => x.IsDeleted)
                .ToListAsync();

            return sale is not null
                ? Results.Ok(sale)
                : Results.NotFound("Could not locate deleted sale entries.");
        }

        // Get sales on query match 
        public static async Task<IResult> GetSaleByQuery(AppDbContext db, string query)
        {
            var sales = await db.Sales
                .Include(s => s.Customer)
                .Include(s => s.SaleItems)
                    .ThenInclude(i => i.Product)
                .Where(s =>
                    s.Customer != null && s.Customer.CustomerName.Contains(query) ||
                    s.SaleItems.Any(si => (si.Product != null && si.Product.ProductName.Contains(query))) ||
                    s.SaleItems.Any(si => (si.Product != null && si.Product.ProductBrand.Contains(query))))
                .ToListAsync();
                
            return sales is not null
                ? Results.Ok(sales)
                : Results.NotFound("Could not locate such a sale in the database.");
        }

        // Post new sale entry
        public static async Task<IResult> PostSale(AppDbContext db, Sale newSale)
        {
            // Make sure that the whole request succeeds or fails uniformly
            await using var dbTransaction = await db.Database.BeginTransactionAsync();

            try
            {
                // Fetch customer (handle whether exists or not)
                var existingCustomer = await db.Customers
                    .FindAsync(newSale.CustomerId);

                if (existingCustomer is null)
                    return Results.BadRequest("Invalid customer.");

                // Fetch products (more W validation)
                if (newSale.SaleItems == null || newSale.SaleItems.Count == 0)
                {
                    return Results.BadRequest("No items provided.");
                }

                // Merge duplicate products (on id)
                var groupedItems = newSale.SaleItems
                    .GroupBy(i => i.ProductId)
                    .Select(g => new OrderItems
                    {
                        ProductId = g.Key,
                        ProductQuantity = g.Sum(x => x.ProductQuantity)
                    })
                    .ToList();

                // Crteate sale obj
                var sale = new Sale
                {
                    CustomerId = newSale.CustomerId,
                    OrderPrice = newSale.OrderPrice,
                    Status = newSale.Status,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false,
                    SaleItems = new List<OrderItems>()
                };


                decimal total = 0;
                // Attaching sale items w/ proper handling
                foreach (var item in groupedItems)
                {
                    var existingProduct = await db.Products
                        .FindAsync(item.ProductId);

                    if (existingProduct is null) return Results.NotFound("Could not locate inventory entry");
                    
                    // Deducting quantity from product entry
                    existingProduct.LastModified = DateTime.UtcNow;
                    
                    if ((existingProduct.ProductStockAmount - item.ProductQuantity) < 0) 
                        return Results.BadRequest($"Insufficient stock of id #{item.ProductId} to execute sale.");

                    existingProduct.ProductStockAmount -= item.ProductQuantity;
                    // Recalculating sale price on run
                    total += existingProduct.ProductPrice * item.ProductQuantity;

                    sale.SaleItems.Add(new OrderItems
                        {
                            ProductId = item.ProductId,
                            ProductQuantity = item.ProductQuantity,
                            ProductPrice = existingProduct.ProductPrice
                        });

                }

                existingCustomer.TotalSpent += total;
                existingCustomer.LastModified = DateTime.UtcNow;
                sale.OrderPrice = total;
                db.Sales.Add(sale);

                // Add transaction to db
                var newTransaction = new Transaction
                {
                    TransactionValue = sale.OrderPrice,
                    TransactionCategory = TransactionCategory.Sale,
                    Description = "Origin: API sale post transaction.",
                    CustomerId = sale.CustomerId,
                };
                db.Transactions.Add(newTransaction);

                // Save
                await db.SaveChangesAsync();
                await dbTransaction.CommitAsync();
                return Results.Created($"Successfully added {sale} to database.", sale);
            }
            catch
            {
                await dbTransaction.RollbackAsync();
                throw;
            }
        }

        // Edit sale entry on ID match
        public static async Task<IResult> PutSale(AppDbContext db, Sale updatedSale, int id)
        {
            var existingSale = await db.Sales
                .FirstOrDefaultAsync(x => x.OrderId == id);

            if (existingSale is null) return Results.NotFound("Could not locate sale entry.");

            db.Entry(existingSale).CurrentValues.SetValues(new
            {
                updatedSale.OrderPrice,
                updatedSale.Status,
                updatedSale.CompletedAt,
                updatedSale.IsDeleted
            });

            // SetValues does not supports List<T> Ts properties
            existingSale.SaleItems = updatedSale.SaleItems;
            
            await db.SaveChangesAsync();
            return Results.Ok("Successfully updated sale entry.");
        }
    }
}