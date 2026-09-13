import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NodeType, NodeStatuses, type NodeSummary, type NodeDetail } from "./types";

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
}

async function putData<T>(url: string, data: any): Promise<T> {
    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
}

async function PostData<T>(url: string, data: any): Promise<T> {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
}

//---------------------------------------

// Get all the root projects
export function useRootNodes() {
    return useQuery({
        queryKey: ['nodes', 'root'],
        queryFn: () => fetchJson<NodeSummary[]>('/api/nodes/root')
    })
}

// Get all children nodes for specified node
export function useNodeChildren(id: string | null) {
    return useQuery({
        queryKey: ['nodes', id, 'children'],
        queryFn: () => fetchJson<NodeSummary[]>(`/api/nodes/${id}/children`),
        enabled: id !== null
    })
}

// Get details for a node
export function useNode(id: string | null) {
  return useQuery({
    queryKey: ['nodes', id],
    queryFn: () => fetchJson<NodeDetail>(`/api/nodes/${id}`),
    enabled: id !== null,
  })
}


// Create a child node under parentId, applied optimistically to that parent's children list
export function useCreateChildNode(parentId: string, parentType: NodeType) {
    const queryClient = useQueryClient();
    const childrenKey = ['nodes', parentId, 'children'];

    return useMutation({
        mutationFn: (title: string) =>
            PostData<NodeSummary>('/api/nodes', { parentId, title }),

        onMutate: async (title) => {
            await queryClient.cancelQueries({ queryKey: childrenKey });

            const previousChildren = queryClient.getQueryData<NodeSummary[]>(childrenKey);

            const childType = (parentType + 1) as NodeType;
            const optimisticNode: NodeSummary = {
                id: `optimistic-${crypto.randomUUID()}`,
                type: childType,
                title,
                status: NodeStatuses[childType][0],
            };

            queryClient.setQueryData<NodeSummary[]>(childrenKey, (old) => [
                ...(old ?? []),
                optimisticNode,
            ]);

            return { previousChildren, optimisticId: optimisticNode.id };
        },

        onError: (_err, _title, context) => {
            queryClient.setQueryData(childrenKey, context?.previousChildren);
        },

        onSuccess: (created, _title, context) => {
            queryClient.setQueryData<NodeSummary[]>(childrenKey, (old) =>
                old?.map((n) => (n.id === context?.optimisticId ? created : n))
            );
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: childrenKey });
        },
    });
}

// Optimistically move a child node to a new status (e.g. kanban drag-and-drop), applied to parentId's children list
export function useUpdateNodeStatus(parentId: string) {
    const queryClient = useQueryClient();
    const childrenKey = ['nodes', parentId, 'children'];

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            putData<NodeSummary>(`/api/nodes/${id}`, { status }),

        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries({ queryKey: childrenKey });

            const previousChildren = queryClient.getQueryData<NodeSummary[]>(childrenKey);

            queryClient.setQueryData<NodeSummary[]>(childrenKey, (old) =>
                old?.map((n) => (n.id === id ? { ...n, status } : n))
            );

            return { previousChildren };
        },

        onError: (_err, _vars, context) => {
            queryClient.setQueryData(childrenKey, context?.previousChildren);
        },

        onSettled: (_data, _err, { id }) => {
            queryClient.invalidateQueries({ queryKey: childrenKey });
            queryClient.invalidateQueries({ queryKey: ['nodes', id] });
        },
    });
}

// Optimistically update a node's details
export function useUpdateNode(id: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<NodeDetail>) => putData<NodeDetail>(`/api/nodes/${id}`, data),
        onMutate: async (newValues) => {
            await queryClient.cancelQueries({ queryKey: ['nodes', id] });

            const previousNode = queryClient.getQueryData<NodeDetail>(['nodes', id]);

            if (previousNode) {
                queryClient.setQueryData<NodeDetail>(['nodes', id], {
                    ...previousNode,
                    ...newValues,
                });
            }

            return { previousNode };
        },
        onError: (_err, _newValues, context) => {
            if (context?.previousNode) {
                queryClient.setQueryData(['nodes', id], context.previousNode);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['nodes', id] });
            queryClient.invalidateQueries({ queryKey: ['nodes'] });
        },
    });
}

