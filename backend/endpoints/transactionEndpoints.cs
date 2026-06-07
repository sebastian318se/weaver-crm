using Microsoft.EntityFrameworkCore;
using TennisCrmApi;

namespace TennisCrmApiEndpoints
{
    public static class TransactionEndpoints
    {
        public static IEndpointRouteBuilder MapTransactionEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("api/transactions", GetTransactions);
            app.MapGet("api/transactions/{id}", GetTransactionsById);
            app.MapGet("api/transactions/deleted", GetDeletedTransactions);

            app.MapPost("api/transactions", PostTransaction);

            app.MapPut("api/transactions/{id}", PutTransaction);

            return app;
        }

        // Get all transactions
        public static async Task<IResult> GetTransactions(AppDbContext db)
        {
            var transactions = await db.Transactions
                .Where(x => !x.IsDeleted)
                .ToListAsync();

            return Results.Ok(transactions);
        }
        
        // Get transactions on ID match
        public static async Task<IResult> GetTransactionsById(int id, AppDbContext db)
        {
            var transaction = await db.Transactions
                .Where(x => !x.IsDeleted)
                .FirstOrDefaultAsync(x => x.TransactionId == id);

            return transaction is not null ?
                Results.Ok(transaction) :
                Results.NotFound("Could not locate transaction.");
        }

        // Get transactionson IsDeleted == true
        public static async Task<IResult> GetDeletedTransactions(AppDbContext db)
        {
            var transactions = await db.Transactions
                .Where(x => x.IsDeleted)
                .ToListAsync();

            return Results.Ok(transactions);
        }

        // Post transaction entry
        public static async Task<IResult> PostTransaction(AppDbContext db, Transaction newTransaction)
        {
            db.Transactions.Add(newTransaction);
            await db.SaveChangesAsync();

            return Results.Created($"Successfully added {newTransaction} to database.", newTransaction);
        }

        // Edit transaction entry on ID match
        public static async Task<IResult> PutTransaction(AppDbContext db, int id, Transaction updatedTransaction)
        {
            var existingTransaction = await db.Transactions
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