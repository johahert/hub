using Hub.Core.Domain;
using Microsoft.EntityFrameworkCore;

namespace Hub.Core.Data;

public static class SeedData {
    public static async Task EnsureSeededAsync(HubDbContext db) {
        if (await db.Nodes.AnyAsync()) return;

        var eraCharge = new Node {
            Type = NodeType.Project,
            Title = "EraCharge",
            Status = NodeStatuses.Default(NodeType.Project),
        };
        var pallappen = new Node {
            Type = NodeType.Project,
            Title = "Pallappen",
            Status = NodeStatuses.Default(NodeType.Project),
        };
        db.Nodes.AddRange(eraCharge, pallappen);
        await db.SaveChangesAsync();

        var refactor = new Node {
            Type = NodeType.Epic,
            ParentId = eraCharge.Id,
            Title = "Service/repository refactor",
            Status = NodeStatuses.Default(NodeType.Epic),
        };
        db.Nodes.Add(refactor);
        await db.SaveChangesAsync();
    }
}