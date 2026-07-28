namespace TennisCrmApi
{
    public class Customer
    {
        // Customer info
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;

        // Customer ownership
        public int TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;

        // Additional info
        public string? CustomerPhone { get; set; }
        public string? CustomerNotes { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime LastModified { get; set; } = DateTime.UtcNow;
        public decimal TotalSpent { get; set; } = 0;
        public int? RacketsStrung { get; set; } = 0;
    }
}