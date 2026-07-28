namespace TennisCrmApi
{
    public class Transaction
    {
        public int TransactionId { get; set; }
        public decimal TransactionValue { get; set; }
        public TransactionCategory TransactionCategory { get; set; }
        public DateTime TransactionCreated { get; set; } = DateTime.UtcNow;
        public DateTime? LastModified { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool IsDeleted { get; set; } = false;
        public int? CustomerId { get; set; }
        public Customer? Customer { get; set; }

        // Transaction Ownership
        public int TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;
    }

    public enum TransactionCategory
    {
        OperationalCost,
        Sale,
        Stringjob,
        ProductAcquisition,
        Other
    }
}