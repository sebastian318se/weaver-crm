namespace TennisCrmApi
{
    public abstract class Order
    {
        public int OrderId { get; set; }

        // Define foreign key and respective object to retrieve data from
        public int CustomerId { get; set; }
        public required Customer Customer { get; set; }

        public decimal OrderPrice { get; set; }
        public OrderStatus Status { get; set; }

        public DateTime CreatedAt { get; set; }  = DateTime.Now; 
        public DateTime? CompletedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
    }

    public class StringJob : Order
    {
        public int MainTension { get; set; }
        public int CrossTension { get; set; }
        public DateTime? ExpectedAt { get; set; }

        // Foreign key to reference racket strung
        public int RacketId { get; set; }
        // Navigator prop
        public Racket? Racket { get; set; }

        // Foreign key to reference string used
        public int StringId { get; set; }
        // Navigator prop
        public TennisString? TennisString { get; set; }
    }

    public class Sale : Order
    {
        public int ProductId { get; set; }
        public required List<Product> SaleProducts { get; set; }
    }

    public enum OrderStatus
    {
        Collected,
        InProgress,
        Completed,
        Cancelled,
        Delivered
    }
}