// Backend-wide JWT configuration - How ASP.NET trusts Clerk
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace TennisCrmApi.Authentication
{
    public static class JwtConfiguration
    {
        public static IServiceCollection AddJwtAuthentication(
            this IServiceCollection services,
            IConfiguration configuration
        )
        {
            services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    options.Authority = "...";

                    options.Audience = "...";

                    options.TokenValidationParameters = new()
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true
                    };
                });

            services.AddAuthorization();

            return services;
        }
    }
}