// Active User DTO
namespace TennisCrmApi
{
    public class CurrentUser
    {
        public string ClerkUserId { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public int TenantId { get; set; }
        public UserRole UserRole { get; set; }
    }
}