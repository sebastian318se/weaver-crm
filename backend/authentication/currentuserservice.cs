using System.Security.Claims;

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
            HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);

        public string? ClerkOrganizationId =>
            HttpContext.User.FindFirstValue("org_id");

        public User? User =>
            HttpContext.Items["CurrentUser"] as User;
    }
}