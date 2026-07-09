namespace TennisCrmApi
{
    public class Transaction
    {
        public int TransactionId { get; set; }
        public decimal TransactionValue { get; set; }
        public TransactionCategory TransactionCategory { get; set; }
        public DateTime TransactionCreated { get; set; } = DateTime.UtcNow;
        public DateTime? LastModified { get; set; }
        public string? Description { get; set; }
        public bool IsDeleted { get; set; } = false;
        public int? CustomerId { get; set; }
        public Customer? Customer { get; set; }
    }

    public enum TransactionCategory
    {
        OperationalCost,
        Sale,
        Stringjob,
        Other
    }
}