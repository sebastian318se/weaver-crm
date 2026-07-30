// Intercept calls and centralize clerk user id matching and stores current user
// Fetch from context -> get id from JWT -> call current user service
namespace TennisCrmApi.Authentication
{
    public class CurrentUserMiddleware
    {
        private readonly RequestDelegate _next;

        // Middleware forwarding constructor
        public CurrentUserMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(
            HttpContext ctx,
            AppDbContext db
        )
        {
            if(ctx.User.Identity?.IsAuthenticated == true)
            {
                var clerkId = ctx.User.FindFirst("sub")?.Value;

                if(clerkId != null)
                {
                    var user = await db.Users
                        .Include(u => u.Tenant)
                        .FirstOrDefaultAsync(u => u.ClerkUserId == clerkId);

                    ctx.Items["CurrentUser"] = user;
                }
            }

            await _next(ctx);
        }
    }
}