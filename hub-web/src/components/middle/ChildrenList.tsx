import {
  DragDropContext,
  Draggable,
  Droppable,
  type DraggableStateSnapshot,
  type DraggingStyle,
  type DropResult,
  type NotDraggingStyle,
} from '@hello-pangea/dnd'
import { useNodeChildren, useNode, useUpdateNodeStatus } from '../../api/nodes'
import { NodeStatuses, NodeType, type NodeSummary } from '../../api/types'
import { useSelection } from '../../stores/selection'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'
import { cn } from '../../lib/utils'
import NewChildForm from './NewChildForm'

const typeLabel: Record<NodeType, string> = {
  [NodeType.Project]: 'Project',
  [NodeType.Epic]: 'Epic',
  [NodeType.WorkItem]: 'Work item',
}

const DOT_COLORS = ['bg-neutral-500', 'bg-accent-500', 'bg-accent-2-500', 'bg-accent-700', 'bg-accent-2-700']

function dragStyle(
  style: DraggingStyle | NotDraggingStyle | undefined,
  snapshot: DraggableStateSnapshot,
) {
  // The optimistic cache update lands before the drop animation finishes, so the card
  // would animate out of a slot it no longer occupies. Cutting the animation short
  // avoids that snap.
  if (!snapshot.isDropAnimating) return style
  return { ...style, transitionDuration: '0.001s' }
}

export function ChildrenList() {
  const { currentNodeId, selectedCardId, setSelectedCard } = useSelection()
  const { data: current } = useNode(currentNodeId)
  const { data: children, isLoading } = useNodeChildren(currentNodeId)
  const updateStatus = useUpdateNodeStatus(currentNodeId ?? '')

  if (!currentNodeId) {
    return (
      <div className="p-4">
        <p className="text-sm text-neutral-600">Select something on the left.</p>
      </div>
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
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <span className="font-heading text-lg">{current?.title ?? '...'}</span>
        {current && <Badge variant="accent">{typeLabel[current.type]}</Badge>}
      </div>

      {isLoading && <p className="text-sm text-neutral-600">Loading…</p>}
      {!isLoading && children?.length === 0 && (
        <p className="text-sm text-neutral-600">No children yet.</p>
      )}

      {current && current.type !== NodeType.WorkItem && (
        <NewChildForm key={currentNodeId} parentId={currentNodeId} parentType={current.type} />
      )}

      {current && current.type !== NodeType.WorkItem && children && children.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="scroll-pane min-h-0 flex-1 overflow-auto">
            <div className="flex h-full min-h-[200px] items-stretch gap-2">
              {statuses.map((status, i) => (
                <div key={status} className="flex w-[220px] flex-none flex-col">
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <span className={cn('h-2 w-2 flex-none rounded-full', DOT_COLORS[i % DOT_COLORS.length])} />
                    <span className="text-sm font-medium">{status}</span>
                    <Badge variant="neutral" className="ml-auto">
                      {columns.get(status)?.length ?? 0}
                    </Badge>
                  </div>

                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          'flex flex-1 flex-col gap-2 rounded-lg p-1.5 transition-colors',
                          snapshot.isDraggingOver ? 'bg-accent-100' : 'bg-transparent',
                        )}
                      >
                        {columns.get(status)?.map((c, index) => (
                          <Draggable key={c.id} draggableId={c.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={dragStyle(provided.draggableProps.style, snapshot)}
                                className={cn(
                                  'cursor-grab border transition-shadow hover:shadow-md',
                                  selectedCardId === c.id ? 'border-accent' : 'border-transparent',
                                  snapshot.isDragging && 'opacity-85'
                                )}
                                onClick={() => setSelectedCard(c.id)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-sm">{c.title}</span>
                                  {c.isBlocked && (
                                    <Badge variant="outline" className="flex-none border-red-600 text-red-600">
                                      Blocked
                                    </Badge>
                                  )}
                                </div>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </div>
        </DragDropContext>
      )}
    </div>
  )
}
