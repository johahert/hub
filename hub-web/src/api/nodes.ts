import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NodeSummary, NodeDetail } from "./types";

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


export function useCreateNode() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<NodeDetail>) => PostData<NodeDetail>('/api/nodes', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nodes'] });
        }
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

