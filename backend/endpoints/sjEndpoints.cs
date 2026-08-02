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

            app.MapPut("api/strung/{id}", PutSJ).RequireAuthorization();

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

            var sj = await db.StringJobs
                .Where(x => x.TenantId == user.TenantId)
                .Where(s =>
                    (s.Customer != null && s.Customer.CustomerName.Contains(query)) ||
                    (s.TennisString != null && s.TennisString.ProductName.Contains(query)) ||
                    (s.Racket != null && s.Racket.ProductName.Contains(query)))
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
                        TenantId = user.TenantId
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
            if(user == null)
                return Results.Unauthorized();

            var sj = await db.StringJobs
                .FirstOrDefaultAsync(x => 
                    x.OrderId == id
                    && x.TenantId == user.TenantId);

            if (sj is null) return Results.NotFound("Could not locate sale entry");

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
                updatedSJ.TennisStringId
            });

            sj.Racket = null;
            sj.TennisString = null;

            await db.SaveChangesAsync();

            return Results.Ok("Successfully updated sale entry");
        }
    }
}