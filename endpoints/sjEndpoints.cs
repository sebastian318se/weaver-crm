using Microsoft.EntityFrameworkCore;

namespace TennisCrmApiEndpoints
{
    public static class StringJobEndpoints
    {
        public static IEndpointRouteBuilder MapSJEndpoints(this IEndpointRouteBuilder app)
        {

            app.MapGet("api/strung", GetSJ);
            app.MapGet("api/strung/{id}", GetSJById);
            
            return app;
        }

        // Get all stringjobs
        public static async Task<IResult> GetSJ(AppDbContext db)
        {
            var strung = await db.StringJobs.ToListAsync();
            return Results.Ok(strung);
        }

        // Get stringjob on ID match
        public static async Task<IResult> GetSJById(int id, AppDbContext db)
        {
            // Return only valid non-null results else "NotFound".
            var strung = await db.StringJobs.FindAsync(id);
            return Results.Ok(strung) is not null
            ? Results.Ok(strung)
            : Results.NotFound("Could not locate string job.");
        }
    }
}