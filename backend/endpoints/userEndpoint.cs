using Microsoft.EntityFrameworkCore;
using TennisCrmApi.Authentication;
using TennisCrmApi;

namespace TennisCrmApiEndpoints
{
    public static class UserEndpoints
    {
        public static IEndpointRouteBuilder MapUserEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapPost("/api/users", PostUser).RequireAuthorization();
            // app.MapPut("/api/users/{id}", PutUser).RequireAuthorization();
        
            return app;
        }

        public static async Task<IResult> PostUser(AppDbContext db, CurrentUserService currentUser, User newUser)
        {
            // Get clerk props to sync db from user service
            // ADD SUPER VALIDATION IN SERVICE TO AVOID null or empty issues
            var clerkUserId = currentUser.ClerkUserId;
            var clerkOrganizationId = currentUser.ClerkOrganizationId;

            if (string.IsNullOrWhiteSpace(clerkUserId))
            return Results.Unauthorized();

            if (string.IsNullOrWhiteSpace(clerkOrganizationId))
                return Results.BadRequest(
                    "No Clerk organization is associated with this user."
                );

            // Locate tenant id to match
            var existingTenantId = await db.Tenants
                .Where(t => t.ClerkOrganizationId == clerkOrganizationId)
                .Select(t => (int?)t.TenantId)
                .FirstOrDefaultAsync();

            if (existingTenantId is null) return Results.BadRequest("No tenant exists for this organization.");

            var tenantId = existingTenantId.Value;

            newUser.ClerkUserId = clerkUserId;
            newUser.TenantId = tenantId;

             var existingUser = await db.Users
                .Where(u => u.TenantId == tenantId)
                .Where(u =>
                    // Disallow entries with duplicate email
                    u.UserEmail == newUser.UserEmail ||
                    u.ClerkUserId != null && newUser.ClerkUserId == u.ClerkUserId)
                    .FirstOrDefaultAsync();

            if (existingUser is not null) return Results.BadRequest("User with this information already exists.");       

            db.Users.Add(newUser);
            await db.SaveChangesAsync();

            return Results.Created($"Successfully added {newUser} to the database", new UserDTO(
                newUser.UserId,
                newUser.UserDisplayName,
                newUser.UserEmail,
                newUser.CreatedAt,
                newUser.TenantId
            ));

            // Don't forget to migrate these
        }
    }

    
}