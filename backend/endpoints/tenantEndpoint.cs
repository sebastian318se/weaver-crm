using Microsoft.EntityFrameworkCore;
using TennisCrmApi.Authentication;
using TennisCrmApi.Services;
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

        public static async Task<IResult> PostTenant(
            TenantService tenantService,
            Tenant newTenant)
        {
            var tenant = await tenantService.CreateTenant(newTenant);

            if (tenant is null)
                return Results.BadRequest("Unable to create tenant.");

            return Results.Created(
                $"/api/tenants/{tenant.TenantId}",
                new TenantDTO(
                    tenant.TenantId,
                    tenant.TenantName,
                    tenant.CreatedAt
                )
            );
        }
    }   
}