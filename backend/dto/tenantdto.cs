namespace TennisCrmApi
{
    public record TenantDTO
    (
        int TenantId,
        string? TenantName,
        DateTime CreatedAt
    );
}