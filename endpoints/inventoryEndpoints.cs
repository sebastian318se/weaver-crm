using Microsoft.EntityFrameworkCore;
using TennisCrmApi;

namespace TennisCrmApiEndpoints
{
    public static class InventoryEndpoints
    {
        public static IEndpointRouteBuilder MapInventoryEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("/api/inventory", GetItems);
            app.MapGet("/api/inventory/{id}", GetItemById);

            app.MapGet("/api/inventory/rackets", GetAll<Racket>);
            app.MapGet("/api/inventory/strings", GetAll<TennisString>);
            app.MapGet("/api/inventory/grips", GetAll<Grip>);
            app.MapGet("/api/inventory/clothes", GetAll<Clothing>);
            app.MapGet("/api/inventory/shoes", GetAll<Shoe>);
            app.MapGet("/api/inventory/balls", GetAll<Ball>);
            app.MapGet("/api/inventory/misc", GetAll<MiscGear>);

            return app;
        }

        // Get all inventory
        public static async Task<IResult> GetItems(AppDbContext db)
        {
            var items = await db.Products.ToListAsync();
            return Results.Ok(items);
        }

        // Get inventory on ID match
        public static async Task<IResult> GetItemById(int id, AppDbContext db)
        {
            var item = await db.Products.FindAsync(id);
            return Results.Ok(item) is not null
            ? Results.Ok(item)
            : Results.NotFound("Could not locate item");
        }

        // Get all items per category
        public static async Task<IResult> GetAll<T>(AppDbContext db)
            where T : class
        {
            var items = await db.Set<T>().ToListAsync();
            return Results.Ok(items);
        }   
    }
}