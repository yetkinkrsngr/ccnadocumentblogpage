using CcnaBlog.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CcnaBlog.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Post> Posts => Set<Post>();
        public DbSet<Comment> Comments => Set<Comment>();

        // Keyless helper sets for raw SQL search/count
        public DbSet<PostSearchRow> PostSearchRows => Set<PostSearchRow>();
        public DbSet<CountResult> CountResults => Set<CountResult>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PostSearchRow>().HasNoKey();
            modelBuilder.Entity<CountResult>().HasNoKey();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => new { u.Provider, u.ProviderId });

            modelBuilder.Entity<Category>()
                .HasIndex(c => c.Slug)
                .IsUnique();

            modelBuilder.Entity<Post>()
                .HasIndex(p => p.Slug)
                .IsUnique();

            modelBuilder.Entity<Post>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Posts)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Post)
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.PostId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    // Helper models for full-text search
    public class PostSearchRow
    {
        public int Id { get; set; }
        public int Rank { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string CategorySlug { get; set; } = string.Empty;
    }

    public class CountResult
    {
        public int Value { get; set; }
    }
}

