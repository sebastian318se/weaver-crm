using Microsoft.EntityFrameworkCore;
using TennisCrmApi;

namespace TennisCrmApiEndpoints
{
    public static class InventoryEndpoints
    {
        public static IEndpointRouteBuilder MapInventoryEndpoints(this IEndpointRouteBuilder app)
        {
            // Name all endpoint paths .WithName()
            app.MapGet("/api/inventory", GetItems);
            app.MapGet("/api/inventory/{id}", GetItemById);

            app.MapGet("/api/inventory/rackets", GetAll<Racket>);
            app.MapGet("/api/inventory/strings", GetAll<TennisString>);
            app.MapGet("/api/inventory/grips", GetAll<Grip>);
            app.MapGet("/api/inventory/clothing", GetAll<Clothing>);
            app.MapGet("/api/inventory/shoes", GetAll<Shoe>);
            app.MapGet("/api/inventory/balls", GetAll<Ball>);
            app.MapGet("/api/inventory/misc", GetAll<MiscGear>);

            app.MapPost("/api/inventory/rackets", PostItem<Racket>);
            app.MapPost("/api/inventory/strings", PostItem<TennisString>);
            app.MapPost("/api/inventory/grips", PostItem<Grip>);
            app.MapPost("/api/inventory/clothing", PostItem<Clothing>);
            app.MapPost("/api/inventory/shoes", PostItem<Shoe>);
            app.MapPost("/api/inventory/balls", PostItem<Ball>);
            app.MapPost("/api/inventory/misc", PostItem<MiscGear>);

            app.MapPut("/api/customers/{id}", PutItem);

            return app;
        }

        // Get all inventory
        public static async Task<IResult> GetItems(AppDbContext db)
        {
            // Order by class name then product name
            var items = await db.Products
                .Where(x => !x.IsDeleted)
                .ToListAsync();

            var sortedItems = items
                .OrderBy(p => p.GetType().Name) // Linq name property
                .ThenBy(p => p.ProductName); // Database name property

            return Results.Ok(sortedItems);
        }

        // Get inventory on ID match
        public static async Task<IResult> GetItemById(int id, AppDbContext db)
        {
            var item = await db.Products
                .Where(x => !x.IsDeleted)
                .FirstOrDefaultAsync(x => x.ProductId == id);
                
            return item is not null
                ? Results.Ok(item)
                : Results.NotFound("Could not locate item");
        }

        // Get all items per category
        public static async Task<IResult> GetAll<T>(AppDbContext db)
            where T : Product
        {
            var items = await db.Set<T>()
                .Where(x => !x.IsDeleted)
                .ToListAsync();

            return Results.Ok(items);
        }

        // Post inventory entry to correct type
        public static async Task<IResult> PostItem<T>(AppDbContext db, T item)
            where T : Product
        {
            db.Set<T>().Add(item);
            await db.SaveChangesAsync();

            return Results.Created($"/api/inventory/{item.ProductId}", item);
        }

        // Edit inventory entry on ID match
        public static async Task<IResult> PutItem(AppDbContext db, Product updatedProduct, int id)
        {
            var existingProduct = await db.Products
                .Where(x => !x.IsDeleted)
                .FirstOrDefaultAsync(x => x.ProductId == id);

            if (existingProduct is null) return Results.NotFound("Could not locate inventory entry");

            db.Entry(existingProduct).CurrentValues.SetValues(updatedProduct);
            await db.SaveChangesAsync();

            return Results.Ok("Successfully updated customer entry");
        }
    }
}