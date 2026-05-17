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

            app.MapPost("/api/sales/", PostSale);

            app.MapPut("/api/sales/{id}", PutSale);

            return app;
        }

        // Get all sales
        public static async Task<IResult> GetSales(AppDbContext db)
        {
            var sales = await db.Sales
                .Where(x => !x.IsDeleted)
                .ToListAsync();

            return Results.Ok(sales); 
        }

        // Get sales on ID match
        public static async Task<IResult> GetSalesById(int id, AppDbContext db)
        {
            var sale = await db.Sales
                .Where(x => !x.IsDeleted)
                .FirstOrDefaultAsync(x => x.OrderId == id);
            
            return sale is not null
                ? Results.Ok(sale)
                : Results.NotFound("Could not locate sale entry");
        }

        // Post new sale entry
        public static async Task<IResult> PostSale(AppDbContext db, Sale newSale)
        {
            db.Sales.Add(newSale);
            await db.SaveChangesAsync();
            
            return Results.Created($"Successfully added {newSale} to database", newSale);
        }

        // Edit sale entry on ID match
        public static async Task<IResult> PutSale(AppDbContext db, Sale updatedSale, int id)
        {
            var existingSale = await db.Sales
                .Where(x => !x.IsDeleted)
                .FirstOrDefaultAsync(x => x.ProductId == id);

            if (existingSale is null) return Results.NotFound("Could not locate sale entry.");

            db.Entry(existingSale).CurrentValues.SetValues(new
            {
                updatedSale.OrderPrice,
                updatedSale.Status,
                updatedSale.CompletedAt,
                updatedSale.IsDeleted
            });

            // SetValues does not supports List<T> Ts properties
            existingSale.SaleProducts = updatedSale.SaleProducts;
            
            await db.SaveChangesAsync();
            return Results.Ok("Successfully updated sale entry.");
        }
    }
}