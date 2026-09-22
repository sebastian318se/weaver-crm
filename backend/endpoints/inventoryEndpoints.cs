using Microsoft.EntityFrameworkCore;
using TennisCrmApi.Authentication;
using TennisCrmApi;

namespace TennisCrmApiEndpoints
{
    public static class InventoryEndpoints
    {
        public static IEndpointRouteBuilder MapInventoryEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("/api/inventory", GetItems).RequireAuthorization();
            app.MapGet("/api/inventory/{id}", GetItemById).RequireAuthorization();
            app.MapGet("/api/inventory/deleted", GetDeleted).RequireAuthorization();

            app.MapGet("/api/inventory/search", GetItemByQuery).RequireAuthorization();
            app.MapGet("/api/inventory/racket/search", GetRacketByQuery).RequireAuthorization();
            app.MapGet("/api/inventory/string/search", GetStringByQuery).RequireAuthorization();

            app.MapGet("/api/inventory/racket", GetAll<Racket>).RequireAuthorization();
            app.MapGet("/api/inventory/string", GetAll<TennisString>).RequireAuthorization();
            app.MapGet("/api/inventory/grip", GetAll<Grip>).RequireAuthorization();
            app.MapGet("/api/inventory/clothing", GetAll<Clothing>).RequireAuthorization();
            app.MapGet("/api/inventory/shoe", GetAll<Shoe>).RequireAuthorization();
            app.MapGet("/api/inventory/ball", GetAll<Ball>).RequireAuthorization();
            app.MapGet("/api/inventory/other", GetAll<Other>).RequireAuthorization();

            app.MapPost("/api/inventory/racket", PostItem<Racket>).RequireAuthorization();
            app.MapPost("/api/inventory/string", PostItem<TennisString>).RequireAuthorization();
            app.MapPost("/api/inventory/grip", PostItem<Grip>).RequireAuthorization();
            app.MapPost("/api/inventory/clothing", PostItem<Clothing>).RequireAuthorization();
            app.MapPost("/api/inventory/shoe", PostItem<Shoe>).RequireAuthorization();
            app.MapPost("/api/inventory/ball", PostItem<Ball>).RequireAuthorization();
            app.MapPost("/api/inventory/other", PostItem<Other>).RequireAuthorization();

            app.MapPut("/api/inventory/{id}", PutItem).RequireAuthorization();

            return app;
        }

        // Get all inventory
        public static async Task<IResult> GetItems(AppDbContext db, CurrentUserService currentUser)
        {
            var user = currentUser.User;
            if(user == null)
                return Results.Unauthorized();

            // Order by class name then product name
            var items = await db.Products
                .Where(x => 
                    !x.IsDeleted
                    && x.TenantId == user.TenantId)
                .Select(x => new
                {
                    Product = x,
                    Discriminator = EF.Property<string>(x, "Discriminator")
                })
                .ToListAsync();

            return Results.Ok(items);
        }

        // Get inventory on ID match, including discriminator for dashboard graphing
        public static async Task<IResult> GetItemById(AppDbContext db, CurrentUserService currentUser, int id)
        {
            var user = currentUser.User;
            if(user == null)
                return Results.Unauthorized();

            var item = await db.Products
                .Where(x => 
                    !x.IsDeleted 
                    && x.ProductId == id
                    && x.TenantId == user.TenantId)
                .Select(x => new
                {
                    Product = x,
                    Discriminator = EF.Property<string>(x, "Discriminator")
                })
                .FirstOrDefaultAsync();

            return item is not null
                ? Results.Ok(item)
                : Results.NotFound("Could not locate item entry");
        }

        // Get inventory on IsDeleted == true
        public static async Task<IResult> GetDeleted(AppDbContext db, CurrentUserService currentUser)
        {
            var user = currentUser.User;
            if(user == null)
                return Results.Unauthorized();

            var items = await db.Products
                .Where(x => 
                    x.IsDeleted
                    && x.TenantId == user.TenantId)
                .ToListAsync();

            return items is not null
                ? Results.Ok(items)
                : Results.NotFound("Could not locate deleted inventory entries");
        }

        // Get products on query match
        public static async Task<IResult> GetItemByQuery(AppDbContext db, CurrentUserService currentUser, string query)
        {
            var user = currentUser.User;
            if(user == null)
                return Results.Unauthorized();
                
            var normalizedQuery = query.ToLower();
            var items = await db.Products
                .Where(x => !x.IsDeleted)
                .Where(x =>
                    x.ProductName.ToLower().Contains(normalizedQuery) ||
                    x.ProductBrand.ToLower().Contains(normalizedQuery) ||
                    x.ProductModel != null && x.ProductModel.ToLower().Contains(normalizedQuery)
                ).Where(x => x.TenantId == user.TenantId)
                .ToListAsync();

            return items is not null
                ? Results.Ok(items)
                : Results.NotFound("Could not locate such a product in the database.");
        }

        // Get rackets on query match 
        public static async Task<IResult> GetRacketByQuery(AppDbContext db, CurrentUserService currentUser, string query)
        {
            var user = currentUser.User;
            if(user == null)
                return Results.Unauthorized();

            var normalizedQuery = query.ToLower();
            var rackets = await db.Products
                .OfType<Racket>()
                .Where(x => !x.IsDeleted)
                .Where(x =>
                    x.ProductName.ToLower().Contains(normalizedQuery) ||
                    x.ProductBrand.ToLower().Contains(normalizedQuery) ||
                    x.ProductModel != null && x.ProductModel.ToLower().Contains(normalizedQuery))
                .Where(x => x.TenantId == user.TenantId)
                .ToListAsync();
                
            Console.Write(query);

            return rackets is not null
                ? Results.Ok(rackets)
                : Results.NotFound("Could not locate such a racket in the database.");
        }

        // Get strings on query match
        public static async Task<IResult> GetStringByQuery(AppDbContext db, CurrentUserService currentUser, string query)
        {
            var user = currentUser.User;
            if(user == null)
                return Results.Unauthorized();

            var normalizedQuery = query.ToLower();
            var strings = await db.Products
                .OfType<TennisString>()
                .Where(x => !x.IsDeleted)
                .Where(x =>
                    x.ProductName.ToLower().Contains(normalizedQuery) ||
                    x.ProductBrand.ToLower().Contains(normalizedQuery) ||
                    x.ProductModel != null && x.ProductModel.ToLower().Contains(normalizedQuery))
                .Where(x => x.TenantId == user.TenantId)
                .ToListAsync();

            return strings is not null
                ? Results.Ok(strings)
                : Results.NotFound("Could not locate such a string in the database.");
        }

        // Get all items per category
        public static async Task<IResult> GetAll<T>(AppDbContext db, CurrentUserService currentUser)
            where T : Product
        {
            var user = currentUser.User;
            if(user == null)
                return Results.Unauthorized();

            var items = await db.Set<T>()
                .Where(x => 
                    !x.IsDeleted
                    && x.TenantId == user.TenantId)
                .ToListAsync();

            return items is not null
                ? Results.Ok(items)
                : Results.NotFound("Could not locate any items of this category");
        }

        // Post inventory entry to correct type
        public static async Task<IResult> PostItem<T>(AppDbContext db, CurrentUserService currentUser, T item)
            where T : Product
        {
            var user = currentUser.User;
            if(user == null)
                return Results.Unauthorized();

            var existingProduct = await db.Products
                .Where( p => 
                    p.ProductName.ToLower() == item.ProductName.ToLower()
                    && p.TenantId == user.TenantId)
                .FirstOrDefaultAsync();

            // Add purchase cost to transaction db
            var newTransaction = new Transaction{
                TransactionValue = item.ProductAcquisitionPrice,
                TransactionCategory = TransactionCategory.ProductAcquisition,
                Description = "Origin: Expense via API add product",
                TenantId = user.TenantId
            };

            newTransaction.TenantId = user.TenantId;

            db.Transactions.Add(newTransaction);

            // Simply update product if entry already exists
            // Running for loop to avoid unnecessary changes. Mismatched id's will break before defaulting again otherwise
            if (existingProduct is not null)
            {
                var productEntry = db.Entry(existingProduct);

                foreach (var property in productEntry.Metadata.GetProperties())
                {
                    if (property.Name == nameof(Product.ProductId) ||
                        property.Name == nameof(Product.ProductStockAmount) ||
                        property.Name == nameof(Product.LastModified))
                    {
                        continue;
                    }

                    property.PropertyInfo?.SetValue(
                        existingProduct,
                        property.PropertyInfo.GetValue(item)
                    );
                }

                // Handle exception properties
                existingProduct.ProductStockAmount += item.ProductStockAmount;
                existingProduct.LastModified = DateTime.UtcNow;

                await db.SaveChangesAsync();
                return Results.Ok("Successfully updated existing product entry");
            }
            else
            {
                item.TenantId = user.TenantId;
                item.LastModified = DateTime.UtcNow;

                db.Set<T>().Add(item);
                await db.SaveChangesAsync();

                return Results.Created($"/api/inventory/{item.ProductId}", item);
            }
            
        }

        // Edit inventory entry on ID match
        public static async Task<IResult> PutItem(AppDbContext db, Product updatedProduct, CurrentUserService currentUser, int id)
        {
            var user = currentUser.User;
            if(user == null)
                return Results.Unauthorized();

            var existingProduct = await db.Products
                .FirstOrDefaultAsync(x => 
                    x.ProductId == id
                    && x.TenantId == user.TenantId);

            if (existingProduct is null) return Results.NotFound("Could not locate inventory entry");
            
            if (existingProduct.GetType() != updatedProduct.GetType()) return Results.BadRequest("Product entry types do not match.");
            
            var originalId = existingProduct.ProductId;
            db.Entry(existingProduct).CurrentValues.SetValues(updatedProduct);
            
            // Exception properties
            existingProduct.ProductId = originalId;
            existingProduct.LastModified = DateTime.UtcNow;

            await db.SaveChangesAsync();
            return Results.Ok("Successfully updated inventory entry");
        }
    }
}