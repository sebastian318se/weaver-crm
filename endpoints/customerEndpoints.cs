using Microsoft.EntityFrameworkCore;

namespace TennisCrmApiEndpoints
{
    public static class CustomerEndpoints
    {
        public static IEndpointRouteBuilder MapCustomers(this IEndpointRouteBuilder app)
        {
            app.MapGet("/api/customers", GetCustomers);
            app.MapGet("/api/customers/{id}", GetCustomersById);

            return app;
        }

        // Get all customers
        public static async Task<IResult> GetCustomers(AppDbContext db)
        {
            var customers = await db.Customers.ToListAsync();
            return Results.Ok(customers);
        }

        // Get customers on ID match
        public static async Task<IResult> GetCustomersById(int id, AppDbContext db)
        {
            var customer = await db.Customers.FindAsync(id);
            return Results.Ok(customer) is not null
            ? Results.Ok(customer)
            : Results.NotFound("Could not locate customer");
        }
    }
}