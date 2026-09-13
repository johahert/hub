export const NodeType = {
    Project: 0,
    Epic: 1,
    WorkItem: 2,
} as const;

export type NodeType = (typeof NodeType)[keyof typeof NodeType];

export const NodeStatuses: Record<NodeType, string[]> = {
    [NodeType.Project]: ['Active', 'Inactive'],
    [NodeType.Epic]: ['Planning', 'Active', 'Done', 'Waiting', 'Cancelled'],
    [NodeType.WorkItem]: ['ToDo', 'InProgress', 'Done', 'Blocked'],
};

export interface NodeSummary {
    id: string,
    type: NodeType,
    title: string,
    status: string,
    isBlocked?: boolean
}

export interface NodeDetail extends NodeSummary {
    parentId: string | null,
    notes: string, 
    blockedReason: string | null,
    dueAt: string | null,
    remindAt: string | null,
    createdAt: string,
    updatedAt: string
}