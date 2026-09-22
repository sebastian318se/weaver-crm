using System.Security.Claims;
using System.Text.Json;

namespace TennisCrmApi.Authentication
{
    public class CurrentUserService
    {
        private readonly IHttpContextAccessor _http;

        public CurrentUserService(IHttpContextAccessor http)
        {
            _http = http;
        }

        private HttpContext HttpContext =>
            _http.HttpContext!;

        public string? ClerkUserId =>
            HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? HttpContext.User.FindFirstValue("sub");

        public string? ClerkOrganizationId
        {
            get
            {
                var orgClaim = HttpContext.User.FindFirstValue("o");
                if (string.IsNullOrEmpty(orgClaim))
                    return null;

                try
                {
                    using var doc = JsonDocument.Parse(orgClaim);
                    if (doc.RootElement.TryGetProperty("id", out var idProp))
                        return idProp.GetString();
                }
                catch (JsonException)
                {
                    // orgClaim wasn't valid JSON — ignore
                }

                return null;
            }
        }

        public User? User =>
            HttpContext.Items["CurrentUser"] as User;
    }
}