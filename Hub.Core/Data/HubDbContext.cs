using System.Security.Cryptography.X509Certificates;
using Hub.Core.Domain;
using Microsoft.EntityFrameworkCore;

namespace Hub.Core.Data;

public class HubDbContext : DbContext
{
    public HubDbContext(DbContextOptions<HubDbContext> options) : base(options)
    {
    }

    public DbSet<Node> Nodes => Set<Node>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<NodeTag> NodeTags => Set<NodeTag>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        base.OnModelCreating(mb);

        mb.Entity<Node>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(500).IsRequired();
            e.Property(x => x.Status).HasMaxLength(50).IsRequired();
            e.HasOne(x => x.Parent)
            .WithMany(x => x.Children)
            .HasForeignKey(x => x.ParentId)
            .OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => x.ParentId);
            e.HasIndex(x => x.DeletedAt);
            e.HasQueryFilter(x => x.DeletedAt == null);

        });

        mb.Entity<Tag>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(100).IsRequired();
            e.HasIndex(x => x.Name).IsUnique();
        });

        mb.Entity<NodeTag>(e =>
        {
            e.HasKey(x => new { x.NodeId, x.TagId });
            e.HasOne(x => x.Tag).WithMany(x => x.NodeTags).HasForeignKey(x => x.TagId);
            e.HasOne(x => x.Node).WithMany(x => x.NodeTags).HasForeignKey(x => x.NodeId);
        });
    }
}