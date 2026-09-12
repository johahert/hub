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

app.UseHttpsRedirection();

app.Run();