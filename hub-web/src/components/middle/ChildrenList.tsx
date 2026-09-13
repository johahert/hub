import { Badge, Card, Group, ScrollArea, Stack, Text } from '@mantine/core'
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { useNodeChildren, useNode, useUpdateNodeStatus } from '../../api/nodes'
import { NodeStatuses, NodeType, type NodeSummary } from '../../api/types'
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
  const updateStatus = useUpdateNodeStatus(currentNodeId ?? '')

  if (!currentNodeId) {
    return (
      <Stack p="md">
        <Text c="dimmed">Select something on the left.</Text>
      </Stack>
    )
  }

  const childType = current ? ((current.type + 1) as NodeType) : null
  const statuses = childType !== null ? NodeStatuses[childType] : []

  const columns = new Map<string, NodeSummary[]>(statuses.map((s) => [s, []]))
  for (const child of children ?? []) {
    columns.get(child.status)?.push(child)
  }

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    updateStatus.mutate({ id: draggableId, status: destination.droppableId })
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

      {current && current.type !== NodeType.WorkItem && children && children.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <ScrollArea offsetScrollbars>
            <Group align="flex-start" gap="sm" wrap="nowrap">
              {statuses.map((status) => (
                <Stack key={status} gap="xs" style={{ minWidth: 220, width: 220 }}>
                  <Group gap="xs">
                    <Text fw={500} size="sm">{status}</Text>
                    <Badge size="sm" variant="light" circle>
                      {columns.get(status)?.length ?? 0}
                    </Badge>
                  </Group>

                  <Droppable droppableId={status}>
                    {(provided) => (
                      <Stack
                        gap="xs"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{ minHeight: 40 }}
                      >
                        {columns.get(status)?.map((c, index) => (
                          <Draggable key={c.id} draggableId={c.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                withBorder
                                padding="sm"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  cursor: 'pointer',
                                  borderColor: selectedCardId === c.id ? 'var(--mantine-color-blue-5)' : undefined,
                                  opacity: snapshot.isDragging ? 0.85 : 1,
                                }}
                                onClick={() => setSelectedCard(c.id)}
                              >
                                <Group justify="space-between" wrap="nowrap">
                                  <Text size="sm">{c.title}</Text>
                                  {c.isBlocked && <Badge size="xs" color="red" variant="light">Blocked</Badge>}
                                </Group>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Stack>
                    )}
                  </Droppable>
                </Stack>
              ))}
            </Group>
          </ScrollArea>
        </DragDropContext>
      )}
    </Stack>
  )
}
