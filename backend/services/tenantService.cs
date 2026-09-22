using Microsoft.EntityFrameworkCore;
using TennisCrmApi.Authentication;

namespace TennisCrmApi.Services
{
    public class TenantService
    {
        private readonly AppDbContext _db;
        private readonly CurrentUserService _currentUser;

        public TenantService(
            AppDbContext db,
            CurrentUserService currentUser)
        {
            _db = db;
            _currentUser = currentUser;
        }

        public async Task<Tenant?> CreateTenant(Tenant newTenant)
        {
            var clerkOrganizationId = _currentUser.ClerkOrganizationId;

            if (string.IsNullOrWhiteSpace(clerkOrganizationId))
                return null;

            var tenantExists = await _db.Tenants
                .AnyAsync(t => t.ClerkOrganizationId == clerkOrganizationId);

            if (tenantExists)
                return null;

            newTenant.ClerkOrganizationId = clerkOrganizationId;

            _db.Tenants.Add(newTenant);
            await _db.SaveChangesAsync();

            return newTenant;
        }
    }
}