public abstract class Product
{
    public string ProductName { get; set; } = string.Empty;
    public string ProductImageUrl { get; set; } = string.Empty;
    public string ProductBrand { get; set; } = string.Empty;
    public string? ProductModel { get; set; }
    public int ProductId { get; set; }
    public decimal ProductPrice { get; set; }
}

public class Racket : Product
{
    public string StringPattern { get; set; } = string.Empty;
    public string GripSize { get; set; } = string.Empty;
    public int HeadSize { get; set; }
    public int Weight { get; set; }
    public int SwingWeight { get; set; }
    public int BeamThickness { get; set; }
    public int Flex { get; set; }
    public decimal Length { get; set; }
}

public class TennisString : Product
{
    public StringMaterial Material { get; set; }
    public bool IsReel { get; set; }
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

public class Shoes : Product
{
    public Surface ShoeSurface { get; set; }
    public decimal Size { get; set; }
}

public class Balls : Product
{
    public Surface BallSurface { get; set; }
}

// Class for all miscellaneous gear and products of low store volume
public class MiscGear : Product
{
    public string MiscInfo { get; set; } = string.Empty;
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