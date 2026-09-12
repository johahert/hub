namespace Hub.Core.Domain;
using System; 
using System.Linq;

public enum NodeType
{
    Project,
    Epic,
    WorkItem,
}

public static class NodeStatuses
{
    public static readonly string[] Project = { "Active", "Inactive" };
    public static readonly string[] Epic = { "Planning", "Active", "Done", "Waiting", "Cancelled" };
    public static readonly string[] WorkItem = { "ToDo", "InProgress", "Done", "Blocked" };

    public static string[] For(NodeType nodeType) => nodeType switch
    {
        NodeType.Project => Project,
        NodeType.Epic => Epic,
        NodeType.WorkItem => WorkItem,
        _ => Array.Empty<string>()
    };

    public static string Default(NodeType nodeType) => For(nodeType).First();
}