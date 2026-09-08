namespace TennisCrmApi
{
    public record CustomerDTO
    (
        int CustomerId,
        string CustomerName,
        string? CustomerEmail,
        string? CustomerPhone,
        DateTime LastModified,
        int? RacketsStrung,
        decimal TotalSpent,
        decimal TotalDue
    );
}