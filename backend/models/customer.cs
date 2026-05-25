namespace TennisCrmApi
{
    public class Customer
    {
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerEmail {get; set; }
        public string? CustomerPhone { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime LastModified { get; set; } = DateTime.UtcNow; 
        // One-to-many relationship between customer and order.
        public List<Order>? Orders { get; set; }
    }
}