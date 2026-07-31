using System.ComponentModel.DataAnnotations.Schema;

namespace TennisCrmApi
{
    [Table("Users")]
    public class User
    {
        // User info
        public int UserId { get; set; }
        public string ClerkUserId { get; set; } = string.Empty;
        public string UserDisplayName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public UserRole UserRole { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // User tenant 
        public int TenantId { get; set; }
        public Tenant? Tenant { get; set; }
    }

    public enum UserRole
    {
        Owner,
        Employee,
        ReadOnly
    }
}