using Hub.Core.Data;
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

app.UseHttpsRedirection();

app.Run();