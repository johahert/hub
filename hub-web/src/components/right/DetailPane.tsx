import { useNode } from '../../api/nodes'
import { useSelection } from '../../stores/selection'
import { Badge } from '../ui/badge'

export function DetailPane() {
  const { selectedCardId } = useSelection()
  const { data: node } = useNode(selectedCardId)

  if (!selectedCardId) {
    return <p className="text-sm text-neutral-600">Select a card to see details.</p>
  }
  if (!node) return <p className="text-sm text-neutral-600">Loading…</p>

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-heading text-xl">{node.title}</h2>
      <Badge variant="accent" className="w-fit">{node.status}</Badge>
      <p className="text-sm text-neutral-600">
        Created {new Date(node.createdAt).toLocaleDateString()}
      </p>
      {node.notes ? (
        <p className="whitespace-pre-wrap text-sm">{node.notes}</p>
      ) : (
        <p className="text-sm text-neutral-600">No notes yet.</p>
      )}
    </div>
  )
}
