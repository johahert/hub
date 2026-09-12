namespace Hub.Core.Domain;

public class Node
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public NodeType Type { get; set; }

    public Guid? ParentId { get; set; }
    public Node? Parent { get; set; }
    public List<Node> Children { get; set; } = new List<Node>();

    public string Title { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;

    public bool IsBlocked { get; set; } 
    public string? BlockedReason { get; set; }

    public int SortOrder { get; set; } 

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DueAt { get; set; }
    public DateTime? RemindAt { get; set; }
    public DateTime? DeletedAt { get; set; }

    public List<NodeTag> NodeTags { get; set; } = new List<NodeTag>();
}