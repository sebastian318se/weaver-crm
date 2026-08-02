namespace TennisCrmApi
{
    public record TransactionDTO
    (
        int TransactionId,
        decimal TransactionValue,
        TransactionCategory TransactionCategory,
        DateTime? LastModified,
        DateTime TransactionCreated,
        string Description,
        int? CustomerId
    );
}