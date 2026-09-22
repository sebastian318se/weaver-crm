using Microsoft.EntityFrameworkCore;
using TennisCrmApi.Authentication;

namespace TennisCrmApi.Services
{
    public record OnboardingSyncRequest(
        string TenantName,
        string UserDisplayName,
        string UserEmail
    );

    public class OnboardingService
    {
        private readonly AppDbContext _db;
        private readonly CurrentUserService _currentUser;

        public OnboardingService(AppDbContext db, CurrentUserService currentUser)
        {
            _db = db;
            _currentUser = currentUser;
        }

        public async Task<bool> Sync(OnboardingSyncRequest request)
        {
            var clerkUserId = _currentUser.ClerkUserId;
            var clerkOrganizationId = _currentUser.ClerkOrganizationId;

            if (string.IsNullOrWhiteSpace(clerkUserId) ||
                string.IsNullOrWhiteSpace(clerkOrganizationId))
                return false;

            var tenant = await _db.Tenants
                .FirstOrDefaultAsync(t => t.ClerkOrganizationId == clerkOrganizationId);

            if (tenant is null)
            {
                tenant = new Tenant
                {
                    TenantName = request.TenantName,
                    ClerkOrganizationId = clerkOrganizationId
                };
                _db.Tenants.Add(tenant);
                await _db.SaveChangesAsync();
            }

            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.ClerkUserId == clerkUserId);

            if (user is null)
            {
                user = new User
                {
                    ClerkUserId = clerkUserId,
                    UserDisplayName = request.UserDisplayName,
                    UserEmail = request.UserEmail,
                    TenantId = tenant.TenantId,
                    UserRole = UserRole.Owner
                };
                _db.Users.Add(user);
                await _db.SaveChangesAsync();
            }

            return true;
        }
    }
}