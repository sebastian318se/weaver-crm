using Microsoft.EntityFrameworkCore;
using TennisCrmApi.Authentication;
using TennisCrmApi.Services;
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

        public static async Task<IResult> PostUser(
            UserService userService,
            User newUser)
        {
            var user = await userService.CreateUser(newUser);

            if (user is null)
                return Results.BadRequest("Unable to create user.");

            return Results.Created(
                $"/api/users/{user.UserId}",
                new UserDTO(
                    user.UserId,
                    user.UserDisplayName,
                    user.UserEmail,
                    user.CreatedAt,
                    user.TenantId
                )
            );
        }
    }

    
}