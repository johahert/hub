import { ChevronRight, Folder, Layers, ListChecks } from 'lucide-react';
import { useState } from 'react'
import { useNodeChildren } from '../../api/nodes'
import { NodeType, type NodeSummary } from '../../api/types'
import { useSelection } from '../../stores/selection'
import { cn } from '../../lib/utils'

function iconFor(type: NodeType) {
  if (type === NodeType.Project) return <Folder size={16} strokeWidth={2.75} />
  if (type === NodeType.Epic) return <Layers size={16} strokeWidth={2.75} />
  return <ListChecks size={16} strokeWidth={2.75} />
}

interface Props {
  node: NodeSummary
}

export function TreeNode({ node }: Props) {
    const [opened, setOpened] = useState(false);
    const { currentNodeId, setCurrentNode } = useSelection();
    const canHaveChildren = node.type !== NodeType.WorkItem;
    const { data: children } = useNodeChildren(opened && canHaveChildren ? node.id : null);
    const active = currentNodeId === node.id;

    return (
        <div>
            <button
                type="button"
                onClick={() => {
                    setCurrentNode(node.id);
                    if (canHaveChildren) setOpened(o => !o);
                }}
                className={cn(
                    'flex w-full items-center gap-2 rounded-full border px-2.5 py-1.5 text-left text-sm transition-colors',
                    active
                        ? 'border-accent-300 bg-accent-200 text-accent-800'
                        : 'border-transparent text-text hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]'
                )}
            >
                {canHaveChildren ? (
                    <ChevronRight
                        size={14}
                        strokeWidth={2.75}
                        className={cn('flex-none text-neutral-600 transition-transform', opened && 'rotate-90')}
                    />
                ) : (
                    <span className="w-3.5 flex-none" />
                )}
                <span className="flex-none text-neutral-700">{iconFor(node.type)}</span>
                <span className="min-w-0 flex-1 truncate">{node.title}</span>
            </button>
            {opened && canHaveChildren && (
                <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-neutral-300 pl-2">
                    {children?.map(child => (
                        <TreeNode key={child.id} node={child} />
                    ))}
                </div>
            )}
        </div>
    )
}
