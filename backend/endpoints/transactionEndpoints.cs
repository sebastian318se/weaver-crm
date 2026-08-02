using Microsoft.EntityFrameworkCore;
using TennisCrmApi.Authentication;
using TennisCrmApi;

namespace TennisCrmApiEndpoints
{
    public static class TransactionEndpoints
    {
        public static IEndpointRouteBuilder MapTransactionEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("api/transactions", GetTransactions).RequireAuthorization();
            app.MapGet("api/transactions/{id}", GetTransactionsById).RequireAuthorization();
            app.MapGet("api/transactions/deleted", GetDeletedTransactions).RequireAuthorization();

            app.MapPost("api/transactions", PostTransaction).RequireAuthorization();

            app.MapPut("api/transactions/{id}", PutTransaction).RequireAuthorization();

            return app;
        }

        // Get all transactions
        public static async Task<IResult> GetTransactions(AppDbContext db, CurrentUserService currentUser)
        {
            var user = currentUser.User;
            // Validate user match on backend
            if(user == null)
                return Results.Unauthorized();

            var transactions = await db.Transactions
                .Where(x => !x.IsDeleted
                    && x.TenantId == user.TenantId)
                .Select(t => new TransactionDTO(
                    t.TransactionId,
                    t.TransactionValue,
                    t.TransactionCategory,
                    t.LastModified,
                    t.TransactionCreated,
                    t.Description,
                    t.CustomerId
                ))
                .ToListAsync();

            return Results.Ok(transactions);
        }
        
        // Get transactions on ID match
        public static async Task<IResult> GetTransactionsById(AppDbContext db, CurrentUserService currentUser, int id)
        {
            var user = currentUser.User;
            if(user == null) 
                return Results.Unauthorized();

            var transaction = await db.Transactions
                .Where(x => !x.IsDeleted
                    && x.TenantId == user.TenantId
                    && x.TransactionId == id)
                .Select(t => new TransactionDTO(
                    t.TransactionId,
                    t.TransactionValue,
                    t.TransactionCategory,
                    t.LastModified,
                    t.TransactionCreated,
                    t.Description,
                    t.CustomerId
                ))
                .FirstOrDefaultAsync();

            return transaction is not null ?
                Results.Ok(transaction) :
                Results.NotFound("Could not locate transaction.");
        }

        // Get transactionson IsDeleted == true
        public static async Task<IResult> GetDeletedTransactions(AppDbContext db, CurrentUserService currentUser)
        {
            var user = currentUser.User;
            if(user == null) 
                return Results.Unauthorized();

            var transactions = await db.Transactions
                .Where(x => x.IsDeleted)
                .Select(t => new TransactionDTO(
                    t.TransactionId,
                    t.TransactionValue,
                    t.TransactionCategory,
                    t.LastModified,
                    t.TransactionCreated,
                    t.Description,
                    t.CustomerId
                ))
                .ToListAsync();

            return Results.Ok(transactions);
        }

        // Post transaction entry
        public static async Task<IResult> PostTransaction(AppDbContext db, Transaction newTransaction, CurrentUserService currentUser)
        {
            var user = currentUser.User;
            if(user == null) 
                return Results.Unauthorized();

            newTransaction.TenantId = user.TenantId;

            db.Transactions.Add(newTransaction);
            await db.SaveChangesAsync();

            return Results.Created($"Successfully added {newTransaction} to database.", new TransactionDTO(
                newTransaction.TransactionId,
                newTransaction.TransactionValue,
                newTransaction.TransactionCategory,
                newTransaction.LastModified,
                newTransaction.TransactionCreated,
                newTransaction.Description,
                newTransaction.CustomerId
            ));
        }

        // Edit transaction entry on ID match
        public static async Task<IResult> PutTransaction(AppDbContext db, Transaction updatedTransaction, CurrentUserService currentUser, int id)
        {
            var user = currentUser.User;
            if(user == null) 
                return Results.Unauthorized();

            var existingTransaction = await db.Transactions
                .Where(t => t.TenantId == user.TenantId)
                .FirstOrDefaultAsync(x => x.TransactionId == id);

            if (existingTransaction is null) return Results.NotFound("Could not locate transaction");

            db.Entry(existingTransaction).CurrentValues.SetValues(new
            {
                updatedTransaction.TransactionValue,
                updatedTransaction.TransactionCategory,
                updatedTransaction.Description,
                updatedTransaction.IsDeleted
            });

            existingTransaction.LastModified = DateTime.UtcNow;

            await db.SaveChangesAsync();
            return Results.Ok("Successfully updated transaction entry");
        }
    }
}