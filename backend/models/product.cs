using System.ComponentModel.DataAnnotations.Schema;

namespace TennisCrmApi
{
    public abstract class Product
    {
        public string ProductName { get; set; } = string.Empty;
        public string ProductBrand { get; set; } = string.Empty;
        public string? ProductImageUrl { get; set; }
        public string? ProductModel { get; set; }
        public int ProductId { get; set; }
        public string? Notes { get; set; }
        public int ProductStockAmount { get; set; }
        public int ProductStockCapacity { get; set; }
        public decimal ProductPrice { get; set; }
        public DateTime LastModified { get; set; }  = DateTime.UtcNow; 
        public bool IsDeleted { get; set; } = false;
        [NotMapped]
        public string Discriminator => GetType().Name;
    }

    public class Racket : Product
    {
        public string StringPattern { get; set; } = string.Empty;
        public string? GripSize { get; set; }
        public int HeadSize { get; set; }
        public int Weight { get; set; }
        public int? SwingWeight { get; set; }
        public int? BeamThickness { get; set; }
        public int? Flex { get; set; }
        public decimal? Length { get; set; }
    }

    public class TennisString : Product
    {
        public StringMaterial? Material { get; set; }
        public bool IsStoreOwned { get; set; } = true;
        public decimal Gauge { get; set; }
    }

    public class Grip : Product
    {
        public GripType Type { get; set; }
    }

    public class Clothing : Product
    {
        public ClothingType Type { get; set; }
        public ClothingSize Size { get; set; }
    }

    public class Shoe : Product
    {
        public Surface ShoeSurface { get; set; }
        public decimal Size { get; set; }
    }

    public class Ball : Product
    {
        public Surface BallSurface { get; set; }
    }

    // Class for all miscellaneous gear and products of low store volume
    public class Other : Product
    {

    }

    public enum ClothingType
    {
        Shirt,
        Shorts,
        Hoodie,
        Pants,
        Hat,
        Wristband,
        Headband,
        Socks,
        Other
    }

    public enum ClothingSize
    {
        ExtraSmall,
        Small,
        Medium,
        Large,
        ExtraLarge,
        Other
    }

    public enum StringMaterial
    {
        Gut,
        Polyester,
        Nylon,
        Multifilament
    }

    public enum Surface
    {
        Hard,
        Clay,
        Grass,
        Mixed
    }

    public enum GripType
    {
        Overgrip,
        CushionGrip,
        LeatherCushionGrip
    }
}