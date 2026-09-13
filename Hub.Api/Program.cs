using Hub.Core.Data;
using Hub.Core.Domain;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
var dbDir = Path.Combine(appData, "Hub");
Directory.CreateDirectory(dbDir);
var dbPath = Path.Combine(dbDir, "hub.db");

builder.Services.AddDbContext<HubDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

builder.Services.AddOpenApi();

var app = builder.Build();

using var scope = app.Services.CreateScope();
var db = scope.ServiceProvider.GetRequiredService<HubDbContext>();
await db.Database.MigrateAsync();
await SeedData.EnsureSeededAsync(db);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/api/nodes/root", async (HubDbContext db) =>
{
    var projects = await db.Nodes
        .Where(n => n.ParentId == null)
        .OrderBy(n => n.SortOrder).ThenBy(n => n.Title)
        .Select(n => new { n.Id, n.Title, n.Type, n.Status })
        .ToListAsync();
    return Results.Ok(projects); 
});

app.MapGet("/api/nodes/{id:guid}", async (Guid id, HubDbContext db) => {
    var node = await db.Nodes
        .Where(n => n.Id == id)
        .Select(n => new
        {
            n.Id,
            n.Type,
            n.ParentId,
            n.Title,
            n.Notes,
            n.Status,
            n.IsBlocked,
            n.BlockedReason,
            n.DueAt,
            n.RemindAt,
            n.CreatedAt,
            n.UpdatedAt  
        })
        .FirstOrDefaultAsync();

    return node is null ? Results.NotFound() : Results.Ok(node);
});

app.MapGet("/api/nodes/{id:guid}/children", async (Guid id, HubDbContext db) => {
    var children = await db.Nodes
    .Where(n => n.ParentId == id)
    .Select(n => new
    {
        n.Id,
        n.Type,
        n.Title,
        n.Status,
        n.IsBlocked,
    })
    .ToListAsync();

    return Results.Ok(children);
});

// implement a post call
app.MapPost("/api/nodes", async (NewNode node, HubDbContext db) =>
{
    var parent = await db.Nodes.FindAsync(node.ParentId);
    if (parent is null) return Results.NotFound();
    if (parent.Type == NodeType.WorkItem) return Results.BadRequest("Work items cannot have children.");

    var childType = (NodeType)((int)parent.Type + 1);
    var n = new Node
    {
        Title = node.Title,
        ParentId = parent.Id,
        Type = childType,
        Status = NodeStatuses.Default(childType),
    };
    await db.Nodes.AddAsync(n);
    await db.SaveChangesAsync();
    var dto = new
    {
        n.Id,
        n.Type,
        n.Title,
        n.Status,
        n.IsBlocked
    };
    return Results.Ok(dto);
});


app.MapPut("/api/nodes/{id:guid}", async (Guid id, UpdateNodeStatus patch, HubDbContext db) =>
{
    var node = await db.Nodes.FindAsync(id);
    if (node is null) return Results.NotFound();
    if (!NodeStatuses.For(node.Type).Contains(patch.Status))
        return Results.BadRequest($"Invalid status '{patch.Status}' for {node.Type}.");

    node.Status = patch.Status;
    node.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.Ok(new { node.Id, node.Type, node.Title, node.Status, node.IsBlocked });
});

app.UseHttpsRedirection();

app.Run();
public record NewNode(Guid ParentId, string Title);
public record UpdateNodeStatus(string Status);