// Clean alternative to separate endpoints. Centralize everything on this 
// file so that only one API call is made and properly validated on whether
// entries exist or not. They return ORM objects instead of IResults.

using Microsoft.EntityFrameworkCore;
using TennisCrmApi.Services;
using TennisCrmApi;

namespace TennisCrmApiEndpoints
{
    public static class OnboardingEndpoints
    {
        public static IEndpointRouteBuilder MapOnboardingEndpoints(
            this IEndpointRouteBuilder app)
        {
            app.MapPost(
                "/api/onboarding/sync",
                Sync
            ).RequireAuthorization();

            return app;
        }

        public static async Task<IResult> Sync(
            OnboardingService onboardingService,
            User newUser,
            Tenant newTenant)
        {
            var success = await onboardingService.Sync(
                newUser,
                newTenant
            );

            if (!success)
                return Results.BadRequest("Unable to synchronize onboarding.");

            return Results.Ok("Onboarding synchronized.");
        }
    }
}