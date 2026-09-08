using Microsoft.EntityFrameworkCore;
using TennisCrmApi.Authentication;
using TennisCrmApi;

namespace TennisCrmApiEndpoints
{
    public static class SalesEndpoints
    {
        public static IEndpointRouteBuilder MapSalesEndpoints (this IEndpointRouteBuilder app)
        {
            app.MapGet("/api/sales", GetSales).RequireAuthorization();
            app.MapGet("/api/sales/{id}", GetSalesById).RequireAuthorization();
            app.MapGet("api/sales/deleted", GetDeleted).RequireAuthorization();

            app.MapGet("api/sales/search", GetSaleByQuery).RequireAuthorization();

            app.MapPost("/api/sales/", PostSale).RequireAuthorization();

            app.MapPut("/api/sales/{id}", PutSale).RequireAuthorization();

            return app;
        }

        // Get all sales
        public static async Task<IResult> GetSales(AppDbContext db, CurrentUserService currentUser)
        {
            var user = currentUser.User;
            if(user == null)
                return Results.Unauthorized();

            var sales = await db.Sales
                .Where(x => 
                    !x.IsDeleted
                    && x.TenantId == user.TenantId)
                .Include(s => s.Customer)
                .Include(s => s.SaleItems)
                    .ThenInclude(i => i.Product)
                .ToListAsync();

            return Results.Ok(sales); 
        }

        // Get sales on ID match
        public static async Task<IResult> GetSalesById(AppDbContext db, CurrentUserService currentUser, int id)
        {
            var user = currentUser.User;
            if(user == null)
                return Results.Unauthorized();

            var sale = await db.Sales
                .Where(x => x.TenantId == user.TenantId)
                .Include(s => s.Customer)
                .Include(s => s.SaleItems)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(x => x.OrderId == id && !x.IsDeleted);
            
            return sale is not null
                ? Results.Ok(sale)
                : Results.NotFound("Could not locate sale entry.");
        }

        // Get sales on IsDeleted == true
        public static async Task<IResult> GetDeleted(AppDbContext db, CurrentUserService currentUser)
        {
            var user = currentUser.User;
            if(user == null)
                return Results.Unauthorized();

            var sale = await db.Sales
                .Where(x => 
                    x.IsDeleted
                    && x.TenantId == user.TenantId)
                .ToListAsync();

            return Results.Ok(sale);
        }

        // Get sales on query match 
        public static async Task<IResult> GetSaleByQuery(AppDbContext db, CurrentUserService currentUser, string query)
        {
            var user = currentUser.User;
            if(user == null)
                return Results.Unauthorized();

            var normalizedQuery = query.ToLower();
            var sales = await db.Sales
                .Where(x => x.TenantId == user.TenantId)
                .Where(s =>
                    s.Customer != null && s.Customer.CustomerName.ToLower().Contains(normalizedQuery) ||
                    s.SaleItems.Any(si => (si.Product != null && si.Product.ProductName.ToLower().Contains(normalizedQuery))) ||
                    s.SaleItems.Any(si => (si.Product != null && si.Product.ProductBrand.ToLower().Contains(normalizedQuery))))
                .Include(s => s.Customer)
                .Include(s => s.SaleItems)
                    .ThenInclude(i => i.Product)
                .ToListAsync();
                
            return Results.Ok(sales);
        }

        // Post new sale entry
        public static async Task<IResult> PostSale(AppDbContext db, CurrentUserService currentUser, Sale newSale)
        {
            // Make sure that the whole request succeeds or fails uniformly
            await using var dbTransaction = await db.Database.BeginTransactionAsync();

            try
            {
                var user = currentUser.User;
                if(user == null)
                    return Results.Unauthorized();

                // Fetch customer (handle whether exists or not)
                var existingCustomer = await db.Customers
                    .FirstOrDefaultAsync(x => 
                        x.CustomerId == newSale.CustomerId
                        &&  x.TenantId == user.TenantId);

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
                    CreatedAt = newSale.CreatedAt,
                    IsDeleted = false,
                    SaleItems = new List<OrderItems>()
                };


                decimal total = 0;
                // Attaching sale items w/ proper handling
                foreach (var item in groupedItems)
                {
                    var existingProduct = await db.Products
                        .FirstOrDefaultAsync(x => 
                            x.ProductId == item.ProductId
                            && x.TenantId == user.TenantId);

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

                if (newSale.Status != OrderStatus.Paid)
                {
                    existingCustomer.TotalDue += total;
                }    

                existingCustomer.LastModified = DateTime.UtcNow;
                sale.OrderPrice = total;
                sale.TenantId = user.TenantId;
                db.Sales.Add(sale);

                // Add transaction to db
                var newTransaction = new Transaction
                {
                    TransactionValue = sale.OrderPrice,
                    TransactionCategory = TransactionCategory.Sale,
                    Description = "Origin: API sale post transaction.",
                    CustomerId = sale.CustomerId,
                    TenantId = user.TenantId,
                    Order = sale
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
        public static async Task<IResult> PutSale(AppDbContext db, CurrentUserService currentUser, Sale updatedSale, int id)
        {
            var user = currentUser.User;
            if (user == null)
                return Results.Unauthorized();

            await using var dbTransaction = await db.Database.BeginTransactionAsync();

            try
            {
                var existingSale = await db.Sales
                    .Include(s => s.SaleItems)
                    .FirstOrDefaultAsync(x =>
                        x.OrderId == id
                        && x.TenantId == user.TenantId);

                if (existingSale is null) return Results.NotFound("Could not locate sale entry.");

                if (updatedSale.SaleItems == null || updatedSale.SaleItems.Count == 0)
                    return Results.BadRequest("No items provided.");

                var oldOrderPrice = existingSale.OrderPrice;
                var oldIsDeleted = existingSale.IsDeleted;
                var oldStatus = existingSale.Status;

                // Snapshot old quantities per product so we can diff against the new items
                var oldQuantities = existingSale.SaleItems
                    .GroupBy(i => i.ProductId)
                    .ToDictionary(g => g.Key, g => g.Sum(x => x.ProductQuantity));

                // Merge duplicate products (on id), same as PostSale
                var groupedItems = updatedSale.SaleItems
                    .GroupBy(i => i.ProductId)
                    .Select(g => new OrderItems
                    {
                        ProductId = g.Key,
                        ProductQuantity = g.Sum(x => x.ProductQuantity)
                    })
                    .ToList();

                var newQuantities = groupedItems.ToDictionary(i => i.ProductId, i => i.ProductQuantity);

                decimal total = 0;
                var newItems = new List<OrderItems>();

                foreach (var item in groupedItems)
                {
                    var existingProduct = await db.Products
                        .FirstOrDefaultAsync(x =>
                            x.ProductId == item.ProductId
                            && x.TenantId == user.TenantId);

                    if (existingProduct is null) return Results.NotFound("Could not locate inventory entry");

                    total += existingProduct.ProductPrice * item.ProductQuantity;

                    newItems.Add(new OrderItems
                    {
                        ProductId = item.ProductId,
                        ProductQuantity = item.ProductQuantity,
                        ProductPrice = existingProduct.ProductPrice
                    });
                }

                // Reconcile stock: apply (new qty - old qty) delta per product across both sets
                var allProductIds = oldQuantities.Keys.Union(newQuantities.Keys);

                foreach (var productId in allProductIds)
                {
                    oldQuantities.TryGetValue(productId, out var oldQty);
                    newQuantities.TryGetValue(productId, out var newQty);

                    var delta = newQty - oldQty; // positive = selling more, needs more stock deducted
                    if (delta == 0) continue;

                    var product = await db.Products
                        .FirstOrDefaultAsync(x =>
                            x.ProductId == productId
                            && x.TenantId == user.TenantId);

                    if (product is null) return Results.NotFound($"Could not locate inventory entry for product #{productId}");

                    if ((product.ProductStockAmount - delta) < 0)
                        return Results.BadRequest($"Insufficient stock of id #{productId} to execute sale.");

                    product.ProductStockAmount -= delta;
                    product.LastModified = DateTime.UtcNow;
                }

                db.Entry(existingSale).CurrentValues.SetValues(new
                {
                    OrderPrice = total,
                    updatedSale.CompletedAt,
                    updatedSale.IsDeleted
                });

                // Fully replace sale items so removed items are actually deleted, not orphaned
                existingSale.SaleItems.Clear();
                foreach (var item in newItems)
                {
                    existingSale.SaleItems.Add(item);
                }

                // Keep the linked transaction's value and deleted-state in sync
                var existingTransaction = await db.Transactions
                    .FirstOrDefaultAsync(t =>
                        t.OrderId == existingSale.OrderId
                        && t.TransactionCategory == TransactionCategory.Sale
                        && t.TenantId == user.TenantId);

                if (existingTransaction is not null)
                {
                    existingTransaction.TransactionValue = total;
                    existingTransaction.IsDeleted = updatedSale.IsDeleted;
                    existingTransaction.LastModified = DateTime.UtcNow;
                }

                // Keep customer's lifetime spend in sync with the price delta,
                // or remove the order's value entirely if it was just soft-deleted
                var existingCustomer = await db.Customers
                    .FirstOrDefaultAsync(x =>
                        x.CustomerId == existingSale.CustomerId
                        && x.TenantId == user.TenantId);

                if (existingCustomer is not null)
                {
                    var oldDue = (!oldIsDeleted && oldStatus != OrderStatus.Paid)
                        ? oldOrderPrice
                        : 0;

                    var newDue = (!updatedSale.IsDeleted && updatedSale.Status != OrderStatus.Paid)
                        ? total
                        : 0;

                    existingCustomer.TotalDue += newDue - oldDue;

                    // TotalSpent is separate
                    var oldSpent = !oldIsDeleted ? oldOrderPrice : 0;
                    var newSpent = !updatedSale.IsDeleted ? total : 0;

                    existingCustomer.TotalSpent += newSpent - oldSpent;

                    existingCustomer.LastModified = DateTime.UtcNow;
                }

                await db.SaveChangesAsync();
                await dbTransaction.CommitAsync();

                return Results.Ok("Successfully updated sale entry.");
            }
            catch
            {
                await dbTransaction.RollbackAsync();
                throw;
            }
        }
    }
}