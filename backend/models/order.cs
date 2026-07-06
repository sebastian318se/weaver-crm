using System.Text.Json.Serialization;

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

        public DateTime CreatedAt { get; set; }  = DateTime.UtcNow; 
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
        public List<OrderItems> SaleItems { get; set; } =new();
    }

    public class OrderItems
    {
        public int OrderItemsId { get; set; }

        public int ProductId { get; set; }
        public Product? Product { get; set; }

        public int ProductQuantity { get; set; }

        public int OrderId { get; set; }

        [JsonIgnore] // Make this not loop and break into 500 server error
        public Sale? Sale { get; set; }
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