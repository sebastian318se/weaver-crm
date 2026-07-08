using Microsoft.EntityFrameworkCore;
using TennisCrmApiEndpoints;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    Console.Write($"Environment = Development");
    app.UseSwagger();
    app.UseSwaggerUI();

    app.UseCors("ReactApp");
}

else Console.Write("Environment is Production");


app.MapSJEndpoints();
app.MapSalesEndpoints();
app.MapInventoryEndpoints();
app.MapCustomerEndpoints();
app.MapTransactionEndpoints();

app.Run();