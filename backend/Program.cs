using Microsoft.EntityFrameworkCore;
using TennisCrmApiEndpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    Console.Write($"Environment = Development");
    app.UseSwagger();
    app.UseSwaggerUI();
}

else Console.Write("Environment is Production");


app.MapSJEndpoints();
app.MapSalesEndpoints();
app.MapInventoryEndpoints();
app.MapCustomerEndpoints();
app.MapTransactionEndpoints();

app.Run();