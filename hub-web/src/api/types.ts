export const NodeType = {
    Project: 1,
    Epic: 2,
    WorkItem: 3,
} as const;

export type NodeType = (typeof NodeType)[keyof typeof NodeType];

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