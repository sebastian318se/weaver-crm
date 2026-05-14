namespace TennisCrmApi
{
    public abstract class Order
    {
        public int OrderId { get; set; }

        // Define foreign key and respective object to retrieve data from
        public int CustomerId { get; set; }
        public Customer? Customer { get; set; }

        public decimal OrderPrice { get; set; }
        public OrderStatus Status { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime CompletedAt { get; set; }
    }

    public class StringJob : Order
    {
        public int MainTension { get; set; }
        public int CrossTension { get; set; }

        // Foreign key to reference racket strung
        public int RacketId { get; set; }
        public Racket? Racket { get; set; }

        // Foreign key to reference string used
        public int StringId { get; set; }
        public TennisString? TenisString { get; set; }
    }

    public class Sale : Order
    {
        public int ProductId { get; set; }
        public Product? Product { get; set; }
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