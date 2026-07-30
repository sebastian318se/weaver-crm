// Execute the clerk id into application user conversion
// Fetch clerk id and match to database, call current user DTO

using Microsoft.EntityFrameworkCore;

namespace TennisCrmApi.Authentication
{
    public class CurrentUserService
{
    private readonly IHttpContextAccessor _http;

    public CurrentUserService(IHttpContextAccessor http)
    {
        _http = http;
    }

    public User CurrentUser =>
        (User)_http.HttpContext!.Items["CurrentUser"]!;
}
}