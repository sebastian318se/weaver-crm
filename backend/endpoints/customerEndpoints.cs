using Microsoft.EntityFrameworkCore;
using TennisCrmApi.Authentication;
using TennisCrmApi;

namespace TennisCrmApiEndpoints
{
    public static class CustomerEndpoints
    {
        public static IEndpointRouteBuilder MapCustomerEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("/api/customers", GetCustomers).RequireAuthorization();
            app.MapGet("/api/customers/{id}", GetCustomersById).RequireAuthorization();
            app.MapGet("/api/customers/deleted", GetDeleted).RequireAuthorization();
            app.MapGet("/api/customers/search", GetCustomersByQuery).RequireAuthorization();

            app.MapPost("/api/customers", PostCustomer).RequireAuthorization();

            app.MapPut("/api/customers/{id}", PutCustomer).RequireAuthorization();

            return app;
        }

        // Get all customers
        public static async Task<IResult> GetCustomers(AppDbContext db, CurrentUserService currentUser)
        {
            var user = currentUser.User;
            // Validate user match on backend
            if(user == null) 
                return Results.Unauthorized();

            // Return tenant-specific results
            var customers = await db.Customers
                .Where(x => !x.IsDeleted
                    && x.TenantId == user.TenantId)
                .ToListAsync();

            return Results.Ok(customers);
        }

        // Get customers on ID match
        public static async Task<IResult> GetCustomersById(AppDbContext db, int id, CurrentUserService currentUser)
        {
            var user = currentUser.User;
            if(user == null) 
                return Results.Unauthorized();

            var customer = await db.Customers
                .Where(x => !x.IsDeleted
                    && x.TenantId == user.TenantId)
                .FirstOrDefaultAsync(x => x.CustomerId == id);

            return customer is not null
                ? Results.Ok(customer)
                : Results.NotFound("Could not locate customer");
        }

        // Get customers on IsDeleted == true
        public static async Task<IResult> GetDeleted(AppDbContext db, CurrentUserService currentUser)
        {
            var user = currentUser.User;
            if(user == null) 
                return Results.Unauthorized();

            var customer = await db.Customers
                .Where(x => x.IsDeleted
                    && x.TenantId == user.TenantId)
                .ToListAsync();

            return Results.Ok(customer);
        }

        // Get customers on string match for any parameter. 
        // Query is inferred from method declaration.
        public static async Task<IResult> GetCustomersByQuery(AppDbContext db, CurrentUserService currentUser, string query)
        {   
            if (string.IsNullOrWhiteSpace(query))
            {
                return Results.BadRequest("Can not query empty entry.");
            }

            var user = currentUser.User;
            if(user == null) 
                return Results.Unauthorized();

            var customer = await db.Customers
                .Where(c => 
                    !c.IsDeleted
                    && c.TenantId == user.TenantId)
                .Where(c =>
                    c.CustomerName.Contains(query) ||
                    c.CustomerEmail != null && c.CustomerEmail.Contains(query) ||
                    c.CustomerPhone != null && c.CustomerPhone.Contains(query)
                )
                .ToListAsync();

            return Results.Ok(customer);
        }

        // Post customer entry
        public static async Task<IResult> PostCustomer(AppDbContext db, Customer newCustomer, CurrentUserService currentUser)
        {  
            var user = currentUser.User;
            if(user == null) 
                return Results.Unauthorized();

            var existingCustomer = await db.Customers
                .Where(c => c.TenantId == user.TenantId)
                .Where(c =>
                    // Disallow entries with duplicate email and phone number (if available)
                    c.CustomerEmail == newCustomer.CustomerEmail ||
                    c.CustomerPhone != null && newCustomer.CustomerPhone == c.CustomerPhone)
                    .ToListAsync();

            if (existingCustomer.Count > 0) return Results.BadRequest("Customer entry already exists.");

            newCustomer.TenantId = user.TenantId;

            db.Customers.Add(newCustomer);
            await db.SaveChangesAsync();

            return Results.Created($"Successfully added {newCustomer} added to the database", newCustomer);
        }

        // Edit customer entry on ID match
        public static async Task<IResult> PutCustomer(AppDbContext db, Customer updatedCustomer, CurrentUserService currentUser, int id)
        {
            var user = currentUser.User;
            if(user == null) 
                return Results.Unauthorized();

            var existingCustomer = await db.Customers
                .Where(c => c.TenantId == user.TenantId)
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