import { Button, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useCreateChildNode } from '../../api/nodes'
import type { NodeType } from '../../api/types'

type Props = {
    parentId: string
    parentType: NodeType
}

const NewChildForm = ({ parentId, parentType }: Props) => {
    const form = useForm({
        initialValues: {
            title: '',
        },
        validate: {
            title: (value) => (value.trim().length === 0 ? 'Title is required' : null),
        }
    })

    const createChild = useCreateChildNode(parentId, parentType)

    const handleSubmit = (values: { title: string }) => {
        createChild.mutate(values.title.trim())
        form.reset()
    }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
    <Stack>
      <TextInput
        label="Title"
        placeholder="Enter title"
        required
        withAsterisk
        key={form.key('title')}
        {...form.getInputProps('title')}
      />
      <Button type="submit" loading={createChild.isPending} disabled={createChild.isPending || !form.isValid()}>Add Child</Button>
    </Stack>
    </form>
  )
}

export default NewChildForm
