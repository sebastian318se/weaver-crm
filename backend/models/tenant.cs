using System.ComponentModel.DataAnnotations.Schema;

namespace TennisCrmApi
{
    [Table("Tenants")]
    public class Tenant
    {
        // Tenant info
        public string TenantName { get; set; } = string.Empty;
        public int TenantId { get; set;}
        public string BusinessName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public SubscriptionStatus SubscriptionStatus { get; set; } = SubscriptionStatus.Trial;

        // Tenant preferences
        public string Language { get; set; } = "en-US";
        public string Currency { get; set; } = "USD";
        public string Timezone { get; set; } = "UTC";

        // Users
        // public ICollection<User> Users { get; set; } = [];
    }

    public enum SubscriptionStatus
    {
        Trial,
        Active,
        PastDue,
        Cancelled
    }
}