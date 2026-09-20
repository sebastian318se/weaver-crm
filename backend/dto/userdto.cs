namespace TennisCrmApi
{
    public record UserDTO
    (
        int UserId,
        string? UserDisplayName,
        string? UserEmail,
        DateTime CreatedAt,
        int TenantId
    );
}