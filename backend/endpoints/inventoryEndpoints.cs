using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
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
            app.MapGet("api/inventory/deleted", GetDeleted);
            app.MapGet("api/inventory/search", GetItemByQuery);

            app.MapGet("/api/inventory/racket", GetAll<Racket>);
            app.MapGet("/api/inventory/string", GetAll<TennisString>);
            app.MapGet("/api/inventory/grip", GetAll<Grip>);
            app.MapGet("/api/inventory/clothing", GetAll<Clothing>);
            app.MapGet("/api/inventory/shoe", GetAll<Shoe>);
            app.MapGet("/api/inventory/ball", GetAll<Ball>);
            app.MapGet("/api/inventory/other", GetAll<Other>);

            app.MapPost("/api/inventory/racket", PostItem<Racket>);
            app.MapPost("/api/inventory/string", PostItem<TennisString>);
            app.MapPost("/api/inventory/grip", PostItem<Grip>);
            app.MapPost("/api/inventory/clothing", PostItem<Clothing>);
            app.MapPost("/api/inventory/shoe", PostItem<Shoe>);
            app.MapPost("/api/inventory/ball", PostItem<Ball>);
            app.MapPost("/api/inventory/other", PostItem<Other>);

            app.MapPut("/api/inventory/{id}", PutItem);

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

        // Get inventory on IsDeleted == true
        public static async Task<IResult> GetDeleted(AppDbContext db)
        {
            var items = await db.Products
                .Where(x => x.IsDeleted)
                .ToListAsync();

            return items is not null
                ? Results.Ok(items)
                : Results.NotFound("Could not locate deleted inventory entries");
        }

        // Get products on query match
        public static async Task<IResult> GetItemByQuery(AppDbContext db, string query)
        {
            var items = await db.Products
                .Where(x =>
                    x.ProductName.Contains(query) ||
                    x.ProductBrand.Contains(query) ||
                    x.ProductModel != null && x.ProductModel.Contains(query)
                ).ToListAsync();

            return items is not null
                ? Results.Ok(items)
                : Results.NotFound("Could not locate such a product in the database.");
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
                .FirstOrDefaultAsync(x => x.ProductId == id);

            if (existingProduct is null) return Results.NotFound("Could not locate inventory entry");
            
            if (existingProduct.GetType() != updatedProduct.GetType()) return Results.BadRequest("Producy entry types do not match.");
            
            var originalId = existingProduct.ProductId;
            db.Entry(existingProduct).CurrentValues.SetValues(updatedProduct);
            
            // Exception properties
            existingProduct.ProductId = originalId;
            existingProduct.LastModified = DateTime.UtcNow;

            await db.SaveChangesAsync();
            return Results.Ok("Successfully updated customer entry");
        }
    }
}