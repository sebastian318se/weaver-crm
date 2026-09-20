using Microsoft.EntityFrameworkCore;
using TennisCrmApi.Authentication;
using TennisCrmApi;

namespace TennisCrmApiEndpoints
{
    public static class TenantEndpoints
    {
        public static IEndpointRouteBuilder MapTenantEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapPost("/api/tenants", PostTenant).RequireAuthorization();
            // app.MapPut("/api/tenants/{id}", PutTenants).RequireAuthorization();
        
            return app;
        }

        public static async Task<IResult> PostTenant(AppDbContext db, CurrentUserService currentUser, Tenant newTenant)
        {
            // Get clerk prop to sync db from user service
            var clerkOrganizationId = currentUser.ClerkOrganizationId;

            if (string.IsNullOrWhiteSpace(clerkOrganizationId))
                return Results.BadRequest(
                    "No Clerk organization is associated with this user."
                );

            // Locate tenant on id match
            var tenantExists = await db.Tenants
                .AnyAsync(t => t.ClerkOrganizationId == clerkOrganizationId);

            if (tenantExists) return Results.BadRequest("Tenant already exists.");

            newTenant.ClerkOrganizationId = clerkOrganizationId;

            db.Tenants.Add(newTenant);
            await db.SaveChangesAsync();

            return Results.Created($"Successfully added {newTenant} to the database", new TenantDTO(
                newTenant.TenantId,
                newTenant.TenantName,
                newTenant.CreatedAt
            ));
        }
    }

    
}