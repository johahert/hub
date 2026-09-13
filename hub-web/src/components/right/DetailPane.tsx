import { Badge, Stack, Text, Title } from '@mantine/core'
import { useNode } from '../../api/nodes'
import { useSelection } from '../../stores/selection'

export function DetailPane() {
  const { selectedCardId } = useSelection()
  const { data: node } = useNode(selectedCardId)

  if (!selectedCardId) {
    return <Text c="dimmed" size="sm">Select a card to see details.</Text>
  }
  if (!node) return <Text c="dimmed" size="sm">Loading…</Text>

  return (
    <Stack>
      <Title order={4}>{node.title}</Title>
      <Badge variant="light">{node.status}</Badge>
      <Text size="sm" c="dimmed">
        Created {new Date(node.createdAt).toLocaleDateString()}
      </Text>
      {node.notes ? (
        <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{node.notes}</Text>
      ) : (
        <Text size="sm" c="dimmed">No notes yet.</Text>
      )}
    </Stack>
  )
}