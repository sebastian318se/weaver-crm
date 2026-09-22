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

        public static IResult Sync(OnboardingService onboardingService)
        {
            var success = onboardingService.Sync();

            if (!success)
                return Results.Unauthorized();

            return Results.Ok("Clerk successfully connected to Weaver.");
        }
    }
}