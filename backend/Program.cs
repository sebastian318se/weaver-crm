using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using TennisCrmApiEndpoints;
using System.Text.Json.Serialization;
using TennisCrmApi.Authentication;
using TennisCrmApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connection = builder.Configuration.GetConnectionString("DefaultConnection");
    Console.WriteLine($"DATABASE: {connection}");

    options.UseNpgsql(connection);
});

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();

builder.Services.AddJwtAuthentication(builder.Configuration);

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<CurrentUserService>();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(
        new JsonStringEnumConverter()
    );
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddScoped<OnboardingService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<TenantService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

}

app.UseCors("ReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<CurrentUserMiddleware>();

app.MapOnboardingEndpoints();

app.MapSJEndpoints();
app.MapSalesEndpoints();
app.MapInventoryEndpoints();
app.MapCustomerEndpoints();
app.MapTransactionEndpoints();

using(var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();