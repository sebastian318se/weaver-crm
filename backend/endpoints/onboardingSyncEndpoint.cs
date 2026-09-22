using TennisCrmApi.Services;

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
            OnboardingSyncRequest request)
        {
            var success = await onboardingService.Sync(request);

            if (!success)
                return Results.Unauthorized();

            return Results.Ok("Clerk successfully connected to Weaver.");
        }
    }
}