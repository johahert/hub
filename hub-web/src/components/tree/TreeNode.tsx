import { NavLink } from '@mantine/core';
import { IconFolder, IconStack2, IconChecklist } from '@tabler/icons-react';
import { useState } from 'react'
import { useNodeChildren } from '../../api/nodes'
import { NodeType, type NodeSummary } from '../../api/types'
import { useSelection } from '../../stores/selection'

function iconFor(type: NodeType) {
  if (type === NodeType.Project) return <IconFolder size={16} />
  if (type === NodeType.Epic) return <IconStack2 size={16} />
  return <IconChecklist size={16} />
}

interface Props {
  node: NodeSummary
}

export function TreeNode({ node }: Props) {
    const [opened, setOpened] = useState(false);
    const { currentNodeId, setCurrentNode } = useSelection();
    const canHaveChildren = node.type !== NodeType.WorkItem;
    const { data: children } = useNodeChildren(opened && canHaveChildren ? node.id : null);

    return (
        <NavLink
            label={node.title}
            active={currentNodeId === node.id}
            leftSection={iconFor(node.type)}
            opened={opened}
            onChange={setOpened}
            onClick={(e) => {
                e.preventDefault();
                setCurrentNode(node.id);
                if(canHaveChildren) {
                    setOpened(o => !o);
                }
            }}
            childrenOffset={20}
        >
            {children?.map(child => (
                <TreeNode key={child.id} node={child} />
            ))}
        </NavLink>
    )
}