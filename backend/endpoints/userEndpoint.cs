using Microsoft.EntityFrameworkCore;
using TennisCrmApi.Authentication;
using TennisCrmApi;
using Microsoft.EntityFrameworkCore.Migrations.Operations;

namespace TennisCrmApiEndpoints
{
    public static class UserEndpoints
    {
        public static IEndpointRouteBuilder MapUserEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapPost("/api/users", PostUser).RequireAuthorization();

            app.MapPut("/api/users/{id}", PutUser).RequireAuthorization();
        
            return app;
        }

        public static async Task<IResult> PostUser(AppDbContext db, CurrentUserService currentUser, User newUser)
        {
            var user = currentUser.User;
            // Validate user match on backend
            if(user == null)
                return Results.Unauthorized();

            // Get clerk props to sync db from user service
            var clerkUserId = currentUser.ClerkUserId;
            var clerkOrganizationId = currentUser.ClerkOrganizationId;

            // Locate tenant id to match
            var existingTenantId = await db.Tenants
                .Where(t => t.ClerkOrganizationId == clerkOrganizationId)
                .Select(t => t.TenantId)
                .FirstOrDefaultAsync();

            newUser.ClerkUserId = clerkUserId;
            newUser.TenantId = existingTenantId;

             var existingUser = await db.Users
                .Where(u => u.TenantId == existingTenantId)
                .Where(u =>
                    // Disallow entries with duplicate email
                    u.UserEmail == newUser.UserEmail ||
                    u.ClerkUserId != null && newUser.ClerkUserId == u.ClerkUserId)
                    .FirstOrDefaultAsync();

            if (existingUser is not null) return Results.BadRequest("User already exists.");       

            db.Users.Add(newUser);
            await db.SaveChangesAsync();

            return Results.Created($"Successfully added {newUser} to the database", new UserDTO(
                newUser.UserId,
                newUser.UserDisplayName,
                newUser.UserEmail,
                newUser.CreatedAt,
                newUser.TenantId
            ));

        }
    }

    
}