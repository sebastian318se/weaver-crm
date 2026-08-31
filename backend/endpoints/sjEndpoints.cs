using Microsoft.EntityFrameworkCore;
using TennisCrmApi.Authentication;
using TennisCrmApi;

namespace TennisCrmApiEndpoints
{
    public static class StringJobEndpoints
    {
        public static IEndpointRouteBuilder MapSJEndpoints(this IEndpointRouteBuilder app)
        {

            app.MapGet("/api/strung", GetSJ).RequireAuthorization();
            app.MapGet("/api/strung/{id}", GetSJById).RequireAuthorization();
            app.MapGet("api/strung/deleted", GetDeleted).RequireAuthorization();

            app.MapGet("api/strung/search", GetSjByQuery).RequireAuthorization();

            app.MapPost("/api/strung/", PostSJ).RequireAuthorization();

            app.MapPut("/api/strung/{id}", PutSJ).RequireAuthorization();

            return app;
        }

        // Get all stringjobs
        public static async Task<IResult> GetSJ(AppDbContext db, CurrentUserService currentUser)
        {
            var user = currentUser.User;
            if(user == null)
                return Results.Unauthorized();

            var sj = await db.StringJobs
                .Where(x => 
                    !x.IsDeleted
                    && x.TenantId == user.TenantId)
                .Include(s => s.Customer)
                .Include(s => s.Racket)
                .Include(s => s.TennisString)
                .ToListAsync();
                
            return sj is not null
                ? Results.Ok(sj)
                : Results.NotFound("Could not locate string job");
        }

        // Get stringjob on ID match
        public static async Task<IResult> GetSJById(AppDbContext db, CurrentUserService currentUser, int id)
        {
            var user = currentUser.User;
            if(user == null)
                return Results.Unauthorized();
                
            // Return only valid non-null results else "NotFound".
            var sj = await db.StringJobs
                .Where(x => 
                    x.OrderId == id 
                    && !x.IsDeleted
                    && x.TenantId == user.TenantId)
                .Include(s => s.Customer)
                .Include(s => s.Racket)
                .Include(s => s.TennisString)
                .FirstOrDefaultAsync();

            return sj is not null
                ? Results.Ok(sj)
                : Results.NotFound("Could not locate string job.");
        }

        // Get stringjob on IsDeleted == true
        public static async Task<IResult> GetDeleted(AppDbContext db, CurrentUserService currentUser)
        {
            var user = currentUser.User;
            if(user == null)
                return Results.Unauthorized();

            var sj = await db.StringJobs
                .Where(x => 
                    x.IsDeleted
                    && x.TenantId == user.TenantId)
                .ToListAsync();

            return Results.Ok(sj);
        }

        // Get sj on query match 
        public static async Task<IResult> GetSjByQuery(AppDbContext db, CurrentUserService currentUser, string query)
        {
            var user = currentUser.User;
            if(user == null)
                return Results.Unauthorized();

            var normalizedQuery = query.ToLower();
            var sj = await db.StringJobs
                .Where(x => x.TenantId == user.TenantId)
                .Where(s =>
                    (s.Customer != null && s.Customer.CustomerName.ToLower().Contains(normalizedQuery)) ||
                    (s.TennisString != null && s.TennisString.ProductName.ToLower().Contains(normalizedQuery)) ||
                    (s.Racket != null && s.Racket.ProductName.ToLower().Contains(normalizedQuery)))
                .Include(s => s.Customer)
                .Include(s => s.Racket)
                .Include(s => s.TennisString)
                .ToListAsync();
                
            return sj is not null
                ? Results.Ok(sj)
                : Results.NotFound("Could not locate such a string job in the database.");
        }

        // Post new SJ entry
        public static async Task<IResult> PostSJ(AppDbContext db, CurrentUserService currentUser, StringJob newSJ)
        {
            // Make sure that the whole request succeeds or fails uniformly
            await using var dbTransaction = await db.Database.BeginTransactionAsync();

            try
            {
                var user = currentUser.User;
                if(user == null)
                    return Results.Unauthorized();

                newSJ.TenantId = user.TenantId;
                
                // Fetch customer (handle whether exists or not)
                var existingCustomer = await db.Customers
                    .FirstOrDefaultAsync(x => 
                        x.CustomerId == newSJ.CustomerId
                        && x.TenantId == user.TenantId);

                if (existingCustomer is null)
                    return Results.BadRequest("Invalid customer.");

                if (newSJ.IsStoreOwned == true)
                {
                    // Deduct quantity from string db entry
                    var existingProduct = await db.Products
                        .FirstOrDefaultAsync(x => 
                            x.ProductId == newSJ.TennisStringId
                            && x.TenantId == user.TenantId);
                    
                    if (existingProduct is null) return Results.NotFound("Could not locate inventory entry");
                    
                    existingProduct.LastModified = DateTime.UtcNow;

                    if ((existingProduct.ProductStockAmount - 1) < 0) 
                        return Results.BadRequest($"Insufficient stock of id #{existingProduct.ProductId} to execute sale.");

                    existingProduct.ProductStockAmount -= 1;
                }

                // Add SJ to transaction db
                var newTransaction = new Transaction
                    {
                        TransactionValue = newSJ.OrderPrice,
                        TransactionCategory = TransactionCategory.Stringjob,
                        Description = "Origin: API stringjob post transaction.",
                        CustomerId = newSJ.CustomerId,
                        TenantId = user.TenantId,
                        Order = newSJ
                    };

                db.StringJobs.Add(newSJ);
                db.Transactions.Add(newTransaction);

                existingCustomer.TotalSpent += newSJ.OrderPrice;
                existingCustomer.RacketsStrung += 1;
                existingCustomer.LastModified = DateTime.UtcNow;
                
                // Save
                await db.SaveChangesAsync();
                await dbTransaction.CommitAsync();
                return Results.Created($"Successfully added {newSJ} to database.", newSJ);
            }
            catch 
            {
                await dbTransaction.RollbackAsync();
                throw;
            }
        }

        // Edit SJ on ID match
        public static async Task<IResult> PutSJ(AppDbContext db, StringJob updatedSJ, CurrentUserService currentUser, int id)
        {
            var user = currentUser.User;
            if (user == null)
                return Results.Unauthorized();

            await using var dbTransaction = await db.Database.BeginTransactionAsync();

            try
            {
                var sj = await db.StringJobs
                    .FirstOrDefaultAsync(x =>
                        x.OrderId == id
                        && x.TenantId == user.TenantId);

                if (sj is null) return Results.NotFound("Could not locate sale entry");

                var oldOrderPrice = sj.OrderPrice;
                var oldIsStoreOwned = sj.IsStoreOwned;
                var oldTennisStringId = sj.TennisStringId;
                var oldIsDeleted = sj.IsDeleted;

                db.Entry(sj).CurrentValues.SetValues(new
                {
                    updatedSJ.OrderPrice,
                    updatedSJ.Status,
                    updatedSJ.CompletedAt,
                    updatedSJ.IsDeleted,
                    updatedSJ.MainTension,
                    updatedSJ.CrossTension,
                    updatedSJ.ExpectedAt,
                    updatedSJ.RacketId,
                    updatedSJ.TennisStringId,
                    updatedSJ.IsStoreOwned
                });

                sj.Racket = null;
                sj.TennisString = null;

                // Reconcile stock if the string used, or the store-owned flag, changed
                if (oldIsStoreOwned && oldTennisStringId != null &&
                    (!updatedSJ.IsStoreOwned || updatedSJ.TennisStringId != oldTennisStringId))
                {
                    // Restore stock to the old string
                    var oldProduct = await db.Products
                        .FirstOrDefaultAsync(x =>
                            x.ProductId == oldTennisStringId
                            && x.TenantId == user.TenantId);

                    if (oldProduct is not null)
                    {
                        oldProduct.ProductStockAmount += 1;
                        oldProduct.LastModified = DateTime.UtcNow;
                    }
                }

                if (updatedSJ.IsStoreOwned &&
                    (!oldIsStoreOwned || updatedSJ.TennisStringId != oldTennisStringId))
                {
                    // Deduct stock from the new string
                    var newProduct = await db.Products
                        .FirstOrDefaultAsync(x =>
                            x.ProductId == updatedSJ.TennisStringId
                            && x.TenantId == user.TenantId);

                    if (newProduct is null) return Results.NotFound("Could not locate inventory entry");

                    if ((newProduct.ProductStockAmount - 1) < 0)
                        return Results.BadRequest($"Insufficient stock of id #{newProduct.ProductId} to execute sale.");

                    newProduct.ProductStockAmount -= 1;
                    newProduct.LastModified = DateTime.UtcNow;
                }

                // Keep the linked transaction's value and deleted-state in sync
                var existingTransaction = await db.Transactions
                    .FirstOrDefaultAsync(t =>
                        t.OrderId == sj.OrderId
                        && t.TransactionCategory == TransactionCategory.Stringjob
                        && t.TenantId == user.TenantId);

                if (existingTransaction is not null)
                {
                    existingTransaction.TransactionValue = updatedSJ.OrderPrice;
                    existingTransaction.IsDeleted = updatedSJ.IsDeleted;
                    existingTransaction.LastModified = DateTime.UtcNow;
                    existingTransaction.Description = "Origin: API stringjob post transaction. EDITED.";
                }

                // Keep customer's lifetime spend in sync with the price delta,
                // or remove the order's value entirely if it was just soft-deleted
                var existingCustomer = await db.Customers
                    .FirstOrDefaultAsync(x =>
                        x.CustomerId == sj.CustomerId
                        && x.TenantId == user.TenantId);

                if (existingCustomer is not null)
                {
                    if (!oldIsDeleted && updatedSJ.IsDeleted)
                    {
                        // Just got deleted: strip out the value it was previously contributing
                        existingCustomer.TotalSpent -= oldOrderPrice;
                    }
                    else
                    {
                        existingCustomer.TotalSpent += (updatedSJ.OrderPrice - oldOrderPrice);
                    }

                    existingCustomer.LastModified = DateTime.UtcNow;
                }

                await db.SaveChangesAsync();
                await dbTransaction.CommitAsync();

                return Results.Ok("Successfully updated sale entry");
            }
            catch
            {
                await dbTransaction.RollbackAsync();
                throw;
            } 
        }
    }
}