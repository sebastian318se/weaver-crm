// Intercept calls and centralize clerk user id matching and stores current user
// Fetch from context -> get id from JWT -> store into context for user service to access
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

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

            foreach(var claim in ctx.User.Claims)
            {
                Console.Write($"{claim.Type} = {claim.Value}");
            }

            if(ctx.User.Identity?.IsAuthenticated == true)
            {
                var clerkId = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

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