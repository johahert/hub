import { Loader2 } from 'lucide-react'
import { useRootNodes } from '../../api/nodes'
import { TreeNode } from './TreeNode'

export function Tree() {
    const { data, isLoading, error } = useRootNodes();

    if (isLoading) {
        return <Loader2 className="animate-spin text-neutral-600" size={20} strokeWidth={2.75} />;
    }

    if (error) {
        return <p className="text-sm text-red-600">Error loading tree</p>;
    }
    if (!data?.length) return <p className="text-sm text-neutral-600">No projects yet</p>
    return (
        <div className="flex flex-col gap-0.5">
            {data?.map(node => (
                <TreeNode key={node.id} node={node} />
            ))}
        </div>
    );
}
