import { useRef, useState } from 'react'
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DraggableStateSnapshot,
  type DraggingStyle,
  type DragStart,
  type DragUpdate,
  type DropResult,
  type NotDraggingStyle,
} from '@hello-pangea/dnd'
import { useNodeChildren, useNode, useUpdateNodeStatus } from '../../api/nodes'
import { NodeStatuses, NodeType, type NodeSummary } from '../../api/types'
import { useSelection } from '../../stores/selection'
import { useDragTilt } from '../../hooks/use-drag-tilt'
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

// The card glides into its slot rather than being cut loose there; the flash is
// the single confirmation that it landed. Mirrors the motion rules in index.css.
const DROP_MS = 410
const DROP_CURVE = 'cubic-bezier(0.16, 0.84, 0.26, 1)'
const FLASH_MS = 640

function dropStyle(
  style: DraggingStyle | NotDraggingStyle | undefined,
  snapshot: DraggableStateSnapshot,
) {
  // Slow the library's own drop curve to the one the board is designed around.
  if (!snapshot.isDropAnimating) return style
  return { ...style, transitionDuration: `${DROP_MS}ms`, transitionTimingFunction: DROP_CURVE }
}

export function ChildrenList() {
  const { currentNodeId, selectedCardId, setSelectedCard } = useSelection()
  const { data: current } = useNode(currentNodeId)
  const { data: children, isLoading } = useNodeChildren(currentNodeId)
  const updateStatus = useUpdateNodeStatus(currentNodeId ?? '')

  const boardRef = useRef<HTMLDivElement | null>(null)
  const tilt = useDragTilt(boardRef)
  const [isDragging, setIsDragging] = useState(false)
  const [overStatus, setOverStatus] = useState<string | null>(null)
  // Where the card has been dropped, before the server has agreed. Applied while
  // rendering so the move is visible the instant the drop animation ends: the
  // optimistic cache write is a tick or two late, and in that gap the card would
  // otherwise flick back to the column it came from.
  const [pendingMove, setPendingMove] = useState<{ id: string; status: string } | null>(null)
  const [flashId, setFlashId] = useState<string | null>(null)

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
    const status = pendingMove?.id === child.id ? pendingMove.status : child.status
    columns.get(status)?.push(child)
  }

  const handleDragStart = (start: DragStart) => {
    setIsDragging(true)
    setOverStatus(start.source.droppableId)
    tilt.start()
  }

  const handleDragUpdate = (update: DragUpdate) => {
    setOverStatus(update.destination?.droppableId ?? null)
  }

  const handleDragEnd = (result: DropResult) => {
    tilt.stop()
    setIsDragging(false)
    setOverStatus(null)

    const { source, destination, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    setPendingMove({ id: draggableId, status: destination.droppableId })
    setFlashId(draggableId)
    window.setTimeout(
      () => setFlashId((shown) => (shown === draggableId ? null : shown)),
      FLASH_MS,
    )

    updateStatus.mutate(
      { id: draggableId, status: destination.droppableId },
      // Hand rendering back to the cache once the request has resolved — whether
      // it stuck or rolled back, the query is the truth from here on.
      { onSettled: () => setPendingMove(null) },
    )
  }

  return (
    <div ref={boardRef} className="kanban-board flex min-h-0 flex-1 flex-col gap-3 p-4">
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
        <DragDropContext
          onDragStart={handleDragStart}
          onDragUpdate={handleDragUpdate}
          onDragEnd={handleDragEnd}
        >
          <div className="scroll-pane min-h-0 flex-1 overflow-auto">
            <div className="flex h-full min-h-[200px] items-stretch gap-2">
              {statuses.map((status, i) => (
                <div
                  key={status}
                  data-over={overStatus === status ? 'true' : 'false'}
                  className="kanban-column flex w-[220px] flex-none flex-col"
                >
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
                        data-over={snapshot.isDraggingOver ? 'true' : 'false'}
                        className="kanban-column__body flex flex-1 flex-col gap-2 rounded-lg p-1.5"
                      >
                        {columns.get(status)?.map((c, index) => (
                          <Draggable key={c.id} draggableId={c.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={dropStyle(provided.draggableProps.style, snapshot)}
                                onClick={() => setSelectedCard(c.id)}
                              >
                                {/* The outer element is the library's to position;
                                    this one carries the lift, so the card can settle
                                    back to rest while it is still gliding. */}
                                <Card
                                  className={cn(
                                    'kanban-card border',
                                    selectedCardId === c.id ? 'border-accent' : 'border-transparent',
                                    snapshot.isDragging ? 'cursor-grabbing' : 'cursor-grab',
                                    snapshot.isDragging && !snapshot.isDropAnimating && 'kanban-card--lifted',
                                    flashId === c.id && 'kanban-card--flash',
                                  )}
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
                              </div>
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

          <div className="kanban-scrim" data-dragging={isDragging ? 'true' : 'false'} aria-hidden="true" />
        </DragDropContext>
      )}
    </div>
  )
}
