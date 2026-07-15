using Microsoft.EntityFrameworkCore;
using TennisCrmApi;

namespace TennisCrmApiEndpoints
{
    public static class StringJobEndpoints
    {
        public static IEndpointRouteBuilder MapSJEndpoints(this IEndpointRouteBuilder app)
        {

            app.MapGet("/api/strung", GetSJ);
            app.MapGet("/api/strung/{id}", GetSJById);
            app.MapGet("api/strung/deleted", GetDeleted);

            app.MapGet("api/strung/search", GetSjByQuery);

            app.MapPost("/api/strung/", PostSJ);

            app.MapPut("api/strung/{id}", PutSJ);

            return app;
        }

        // Get all stringjobs
        public static async Task<IResult> GetSJ(AppDbContext db)
        {
            var sj = await db.StringJobs
                .Include(s => s.Customer)
                .Include(s => s.Racket)
                .Include(s => s.TennisString)
                .Where(x => !x.IsDeleted)
                .ToListAsync();
                
            return sj is not null
                ? Results.Ok(sj)
                : Results.NotFound("Could not locate string job");
        }

        // Get stringjob on ID match
        public static async Task<IResult> GetSJById(int id, AppDbContext db)
        {
            // Return only valid non-null results else "NotFound".
            var sj = await db.StringJobs
                .Include(s => s.Customer)
                .Include(s => s.Racket)
                .Include(s => s.TennisString)
                .FirstOrDefaultAsync(x => x.OrderId == id && !x.IsDeleted);

            return sj is not null
                ? Results.Ok(sj)
                : Results.NotFound("Could not locate string job.");
        }

        // Get stringjob on IsDeleted == true
        public static async Task<IResult> GetDeleted(AppDbContext db)
        {
            var sj = await db.StringJobs
                .Where(x => x.IsDeleted)
                .ToListAsync();

            return sj is not null
                ? Results.Ok(sj)
                : Results.NotFound("Could not locate deleted stringjob entries.");
        }

        // Get sj on query match 
        public static async Task<IResult> GetSjByQuery(AppDbContext db, string query)
        {
            var sj = await db.StringJobs
                .Include(s => s.Customer)
                .Include(s => s.Racket)
                .Include(s => s.TennisString)
                .Where(s =>
                    (s.Customer != null && s.Customer.CustomerName.Contains(query)) ||
                    (s.TennisString != null && s.TennisString.ProductName.Contains(query)) ||
                    (s.Racket != null && s.Racket.ProductName.Contains(query)))
                .ToListAsync();
                
            return sj is not null
                ? Results.Ok(sj)
                : Results.NotFound("Could not locate such a string job in the database.");
        }

        // Post new SJ entry
        public static async Task<IResult> PostSJ(AppDbContext db, StringJob newSJ)
        {

            // Make sure that the whole request succeeds or fails uniformly
            await using var dbTransaction = await db.Database.BeginTransactionAsync();

            try
            {
                db.StringJobs.Add(newSJ);
                

                // Fetch customer (handle whether exists or not)
                var existingCustomer = await db.Customers
                    .FindAsync(newSJ.CustomerId);

                if (existingCustomer is null)
                    return Results.BadRequest("Invalid customer.");

                if (newSJ.IsStoreOwned != false)
                {
                    // Deduct quantity from string db entry
                    var existingProduct = await db.Products
                        .FindAsync(newSJ.TennisStringId);
                    
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
                    };
                db.Transactions.Add(newTransaction);

                existingCustomer.TotalSpent += newSJ.OrderPrice;
                existingCustomer.RacketsStrung += 1;
                existingCustomer.LastModified = DateTime.UtcNow;
                await db.SaveChangesAsync();

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
        public static async Task<IResult> PutSJ(AppDbContext db, StringJob updatedSJ, int id)
        {
            var sj = await db.StringJobs
                .FirstOrDefaultAsync(x => x.OrderId == id);

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