import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { NodeSummary, NodeDetail } from "./types";

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
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

export function UseCreateNode(data: any){
    return PostData<NodeDetail>('/api/nodes', data);
}