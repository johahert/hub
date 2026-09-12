namespace Hub.Core.Domain;

public class Tag
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public List<NodeTag> NodeTags { get; set; } = new List<NodeTag>();
}

public class NodeTag
{
    public Guid NodeId { get; set; }
    public Node Node { get; set; } = null!;
    public Guid TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}