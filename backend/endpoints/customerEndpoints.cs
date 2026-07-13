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
            app.MapGet("api/customers/deleted", GetDeleted);
            app.MapGet("api/customers/search", GetCustomersByQuery);

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

        // Get customers on IsDeleted == true
        public static async Task<IResult> GetDeleted(AppDbContext db)
        {
            var customer = await db.Customers
                .Where(x => x.IsDeleted)
                .ToListAsync();

            return customer is not null
                ? Results.Ok(customer)
                : Results.NotFound("Could not locate deleted customer entries.");
        }

        // Get customers on string match for any parameter. 
        // Query is inferred from method declaration.
        public static async Task<IResult> GetCustomersByQuery(AppDbContext db, string query)
        {   
            if (string.IsNullOrWhiteSpace(query))
            {
                return Results.BadRequest("Can not query empty entry.");
            }

            var customer = await db.Customers
                .Where( c =>
                    c.CustomerName.Contains(query) ||
                    c.CustomerEmail != null && c.CustomerEmail.Contains(query) ||
                    c.CustomerPhone != null && c.CustomerPhone.Contains(query)
                ).ToListAsync();

            return customer is not null
                ? Results.Ok(customer)
                : Results.NotFound("No customer entry match.");
        }

        // Post customer entry
        public static async Task<IResult> PostCustomer(AppDbContext db, Customer newCustomer)
        {   
            var existingCustomer = await db.Customers
                .Where( c =>
                    // Disallow entries with duplicate email and phone number (if available)
                    c.CustomerEmail.Contains(newCustomer.CustomerEmail) ||
                    c.CustomerPhone != null && newCustomer.CustomerPhone.Contains(c.CustomerPhone)
                    ).ToListAsync();

            if (existingCustomer is not null) return Results.BadRequest("Customer entry already exists.");

            db.Customers.Add(newCustomer);
            await db.SaveChangesAsync();

            return Results.Created($"Successfully added {newCustomer} added to the database", newCustomer);
        }

        // Edit customer entry on ID match
        public static async Task<IResult> PutCustomer(AppDbContext db, Customer updatedCustomer, int id)
        {
            var existingCustomer = await db.Customers
                .FirstOrDefaultAsync(x => x.CustomerId == id);
            
            if (existingCustomer is null) return Results.NotFound("Could not locate customer entry");

            db.Entry(existingCustomer).CurrentValues.SetValues(new
            {
                updatedCustomer.CustomerName,
                updatedCustomer.CustomerEmail,
                updatedCustomer.CustomerPhone,
                updatedCustomer.IsDeleted,
            });

            existingCustomer.LastModified = DateTime.UtcNow;

            await db.SaveChangesAsync();
            return Results.Ok("Successfully updated customer.");
        }
    }
}