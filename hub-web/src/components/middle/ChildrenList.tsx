import { Badge, Card, Group, Stack, Text } from '@mantine/core'
import { useNodeChildren, useNode } from '../../api/nodes'
import { NodeType } from '../../api/types'
import { useSelection } from '../../stores/selection'
import NewChildForm from './NewChildForm'

const typeLabel: Record<NodeType, string> = {
  [NodeType.Project]: 'Project',
  [NodeType.Epic]: 'Epic',
  [NodeType.WorkItem]: 'Work item',
}

export function ChildrenList() {
  const { currentNodeId, selectedCardId, setSelectedCard } = useSelection()
  const { data: current } = useNode(currentNodeId)
  const { data: children, isLoading } = useNodeChildren(currentNodeId)

  if (!currentNodeId) {
    return (
      <Stack p="md">
        <Text c="dimmed">Select something on the left.</Text>
      </Stack>
    )
  }

  return (
    <Stack p="md" gap="sm">
      <Group gap="xs">
        <Text fw={600}>{current?.title ?? '...'}</Text>
        {current && <Badge variant="light">{typeLabel[current.type]}</Badge>}
      </Group>

      {isLoading && <Text c="dimmed" size="sm">Loading…</Text>}
      {!isLoading && children?.length === 0 && (
        <Text c="dimmed" size="sm">No children yet.</Text>
      )}
    
      {current && current.type !== NodeType.WorkItem && (
        <NewChildForm key={currentNodeId} parentId={currentNodeId} parentType={current.type} />
      )}

      <Stack gap="xs">
        {children?.map((c) => (
          <Card
            key={c.id}
            withBorder
            padding="sm"
            style={{
              cursor: 'pointer',
              borderColor: selectedCardId === c.id ? 'var(--mantine-color-blue-5)' : undefined,
            }}
            onClick={() => setSelectedCard(c.id)}
          >
            <Group justify="space-between">
              <Text>{c.title}</Text>
              <Badge size="sm" variant="light">{c.status}</Badge>
            </Group>
          </Card>
        ))}
      </Stack>
    </Stack>
  )
}