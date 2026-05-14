using Microsoft.EntityFrameworkCore;

namespace TennisCrmApiEndpoints
{
    public static class SalesEndpoints
    {
        public static IEndpointRouteBuilder MapSalesEndpoints (this IEndpointRouteBuilder app)
        {
            app.MapGet("/api/sales", GetSales);
            app.MapGet("/api/sales/{id}", GetSalesById);

            return app;
        }

        // Get all sales
        public static async Task<IResult> GetSales(AppDbContext db)
        {
            var sales = await db.Sales.ToListAsync();
            return Results.Ok(sales); 
        }

        // Get sales on ID match
        public static async Task<IResult> GetSalesById(int id, AppDbContext db)
        {
            var sales = await db.Sales.FindAsync(id);
            return Results.Ok(sales) is not null
            ? Results.Ok(sales)
            : Results.NotFound("Could not locate sale");
        }
    }
}