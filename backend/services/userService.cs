using Microsoft.EntityFrameworkCore;
using TennisCrmApi.Authentication;

namespace TennisCrmApi.Services
{
    public class UserService
    {
        private readonly AppDbContext _db;
        private readonly CurrentUserService _currentUser;

        public UserService(
            AppDbContext db,
            CurrentUserService currentUser)
        {
            _db = db;
            _currentUser = currentUser;
        }

        public async Task<User?> CreateUser(User newUser)
        {
            var clerkUserId = _currentUser.ClerkUserId;
            var clerkOrganizationId = _currentUser.ClerkOrganizationId;

            if (string.IsNullOrWhiteSpace(clerkUserId) ||
                string.IsNullOrWhiteSpace(clerkOrganizationId))
                return null;

            var tenantId = await _db.Tenants
                .Where(t => t.ClerkOrganizationId == clerkOrganizationId)
                .Select(t => (int?)t.TenantId)
                .FirstOrDefaultAsync();

            if (tenantId is null)
                return null;

            newUser.ClerkUserId = clerkUserId;
            newUser.TenantId = tenantId.Value;

            var existingUser = await _db.Users
                .Where(u => u.TenantId == tenantId.Value)
                .Where(u =>
                    u.UserEmail == newUser.UserEmail ||
                    (u.ClerkUserId != null &&
                     u.ClerkUserId == newUser.ClerkUserId))
                .FirstOrDefaultAsync();

            if (existingUser is not null)
                return null;

            _db.Users.Add(newUser);
            await _db.SaveChangesAsync();

            return newUser;
        }
    }
}