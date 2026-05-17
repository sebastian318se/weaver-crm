using Microsoft.EntityFrameworkCore;
using TennisCrmApi;

namespace TennisCrmApiEndpoints
{
    public static class StringJobEndpoints
    {
        public static IEndpointRouteBuilder MapSJEndpoints(this IEndpointRouteBuilder app)
        {

            app.MapGet("/api/strung", GetSJ);
            app.MapGet("/api/strung/{id}", GetSJById);
            
            app.MapPost("/api/strung", PostSJ);

            return app;
        }

        // Get all stringjobs
        public static async Task<IResult> GetSJ(AppDbContext db)
        {
            var sj = await db.StringJobs
                .Where(x => !x.IsDeleted)
                .ToListAsync();
                
            return Results.Ok(sj);
        }

        // Get stringjob on ID match
        public static async Task<IResult> GetSJById(int id, AppDbContext db)
        {
            // Return only valid non-null results else "NotFound".
            var sj = await db.StringJobs
                .Where(x => !x.IsDeleted)
                .FirstOrDefaultAsync(x => x.OrderId == id);

            return sj is not null
                ? Results.Ok(sj)
                : Results.NotFound("Could not locate string job.");
        }

        // Post new SJ entry
        public static async Task<IResult> PostSJ(AppDbContext db, StringJob newSJ)
        {
            db.StringJobs.Add(newSJ);
            await db.SaveChangesAsync();

            return Results.Created($"Successfully added {newSJ} to database.", newSJ);
        }

        // Edit SJ on ID match
        public static async Task<IResult> PutSJ(AppDbContext db, StringJob updatedSJ, int id)
        {
            var sj = await db.StringJobs
                .Where(x => !x.IsDeleted)
                .FirstOrDefaultAsync(x => x.OrderId == id);

            if (sj is null) return Results.NotFound("Could not locate sale entry");

            db.Entry(sj).CurrentValues.SetValues(new
            {
                updatedSJ.OrderPrice,
                updatedSJ.Status,
                updatedSJ.CompletedAt,
                updatedSJ.IsDeleted,
                updatedSJ.MainTension,
                updatedSJ.CrossTension,
                updatedSJ.ExpectedAt,
                updatedSJ.RacketId,
                updatedSJ.StringId
            });

            sj.Racket = null;
            sj.TennisString = null;
            
            await db.SaveChangesAsync();

            return Results.Ok("Successfully updated sale entry");
        }
    }
}