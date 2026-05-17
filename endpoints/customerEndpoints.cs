using Microsoft.EntityFrameworkCore;
using TennisCrmApi;

namespace TennisCrmApiEndpoints
{
    public static class CustomerEndpoints
    {
        public static IEndpointRouteBuilder MapCustomerEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("/api/customers", GetCustomers);
            app.MapGet("/api/customers/{id}", GetCustomersById);

            app.MapPost("/api/customers", PostCustomer);

            app.MapPut("/api/customers/{id}", PutCustomer);

            return app;
        }

        // Get all customers
        public static async Task<IResult> GetCustomers(AppDbContext db)
        {
            var customers = await db.Customers
                .Where(x => !x.IsDeleted)
                .ToListAsync();

            return Results.Ok(customers);
        }

        // Get customers on ID match
        public static async Task<IResult> GetCustomersById(int id, AppDbContext db)
        {
            var customer = await db.Customers
                .Where(x => !x.IsDeleted)
                .FirstOrDefaultAsync(x => x.CustomerId == id);

            return customer is not null
                ? Results.Ok(customer)
                : Results.NotFound("Could not locate customer");
        }

        // Post customer entry
        public static async Task<IResult> PostCustomer(AppDbContext db, Customer newCustomer)
        {
            db.Customers.Add(newCustomer);
            await db.SaveChangesAsync();

            return Results.Created($"Successfully added {newCustomer} added to the database", newCustomer);
        }

        // Edit customer entry on ID match
        public static async Task<IResult> PutCustomer(AppDbContext db, Customer updatedCustomer, int id)
        {
            // PROPERLY HANDLE OVERWRITES AND P KEY EXEMPTION
            var existingCustomer = await db.Customers
                .Where(x => !x.IsDeleted)
                .FirstOrDefaultAsync(x => x.CustomerId == id);
            
            if (existingCustomer is null) return Results.NotFound("Could not locate customer entry");

            db.Entry(existingCustomer).CurrentValues.SetValues(new
            {
                updatedCustomer.CustomerName,
                updatedCustomer.CustomerEmail,
                updatedCustomer.CustomerPhone,
                updatedCustomer.IsDeleted,
                LastModified = DateTime.Now
            });

            await db.SaveChangesAsync();
            return Results.Ok("Successfully updated customer.");
        }
    }
}