using Microsoft.EntityFrameworkCore;
using TennisCrmApi;

public class AppDbContext : DbContext
{
    // Constructor for AppDbContext configurations
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Customer> Customers { get; set; }

    public DbSet<Transaction> Transactions { get; set; }

    // Products
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Racket> Rackets => Set<Racket>();
    public DbSet<TennisString> TennisStrings => Set<TennisString>();
    public DbSet<Grip> Grips => Set<Grip>();
    public DbSet<Clothing> Clothes => Set<Clothing>();
    public DbSet<Shoe> Shoes => Set<Shoe>();
    public DbSet<Ball> Balls => Set<Ball>();
    public DbSet<MiscGear> Miscellaneous => Set<MiscGear>();

    // Orders
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<StringJob> StringJobs => Set<StringJob>();
}