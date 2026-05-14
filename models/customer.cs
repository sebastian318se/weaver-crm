namespace TennisCrmApi
{
    public class Customer
    {
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail {get; set; }  = string.Empty;
        public string CustomerPhone { get; set; } =  string.Empty;

        // One-to-many relationship between customer and order.
        public List<Order>? Orders { get; set; }
    }
}