using Microsoft.EntityFrameworkCore;

// Execute the clerk id into application user conversion
// Fetch clerk id and match to database, call current user DTO

namespace TennisCrmApi.Authentication
{
    public class CurrentUserService
    {
        private readonly IHttpContextAccessor _http;
        
        // Store the object that knows the http context
        public CurrentUserService(IHttpContextAccessor http)
        {
            _http = http;
        }

        public User User =>
            (User)_http.HttpContext!.Items["CurrentUser"]!;
    }
}