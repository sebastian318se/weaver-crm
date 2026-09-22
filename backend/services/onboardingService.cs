using Microsoft.EntityFrameworkCore;
using TennisCrmApi.Authentication;

namespace TennisCrmApi.Services
{
    public class OnboardingService
    {
        private readonly AppDbContext _db;
        private readonly CurrentUserService _currentUser;

        public OnboardingService(
            AppDbContext db,
            CurrentUserService currentUser)
        {
            _db = db;
            _currentUser = currentUser;
        }

        public async Task<bool> Sync(User newUser, Tenant newTenant)
        {
            var clerkUserId = _currentUser.ClerkUserId;
            var clerkOrganizationId = _currentUser.ClerkOrganizationId;

            if (string.IsNullOrWhiteSpace(clerkUserId) ||
                string.IsNullOrWhiteSpace(clerkOrganizationId))
                return false;

            await using var transaction = await _db.Database.BeginTransactionAsync();

            try
            {
                // Find or create tenant
                var tenant = await _db.Tenants
                    .FirstOrDefaultAsync(
                        t => t.ClerkOrganizationId == clerkOrganizationId);

                if (tenant is null)
                {
                    newTenant.ClerkOrganizationId = clerkOrganizationId;

                    _db.Tenants.Add(newTenant);
                    await _db.SaveChangesAsync();

                    tenant = newTenant;
                }

                // Find or create user
                var userExists = await _db.Users
                    .AnyAsync(u => u.ClerkUserId == clerkUserId);

                if (!userExists)
                {
                    newUser.ClerkUserId = clerkUserId;
                    newUser.TenantId = tenant.TenantId;

                    _db.Users.Add(newUser);
                    await _db.SaveChangesAsync();
                }

                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                return false;
            }
        }
    }
}