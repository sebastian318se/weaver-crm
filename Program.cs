using Microsoft.EntityFrameworkCore;
using TennisCrmApiEndpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

app.MapSJEndpoints();
app.MapSalesEndpoints();
app.MapInventoryEndpoints();
app.MapCustomerEndpoints();

app.Run();
// GET: All Sales, Sales by ID; Each order all entries, by ID; All customers, customers by ID
// POST: Orders, Sales, Customers
// PUT: Orders, Sales, Customers
// DELETE: Make method to make backup of deletes entries
// -> MAKE STASH TABLE IN DB. "Import" entries deleted from DB 