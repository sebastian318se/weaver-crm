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


        // Post new sale entry
        public static async Task<IResult> PostSale(AppDbContext db, Sale newSale)
        {

            // Fetch customer (handle whether exists or not)
            var customerExists = await db.Customers
                .AnyAsync(c => c.CustomerId == newSale.CustomerId);

            if (!customerExists)
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

            // Attaching sale items w/ proper handling1
            foreach (var item in newSale.SaleItems)
            {
                var productExists = await db.Products
                    .AnyAsync(p => p.ProductId == item.ProductId);

                if (!productExists)
                    return Results.BadRequest($"Invalid product ID: {item.ProductId}");

                sale.SaleItems.Add(new OrderItems
                {
                    ProductId = item.ProductId,
                    ProductQuantity = item.ProductQuantity
                });
            }

            // Save sale
            db.Sales.Add(sale);
            await db.SaveChangesAsync();

            await db.SaveChangesAsync();

            return Results.Created($"/api/sales/{sale.OrderId}", sale);
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