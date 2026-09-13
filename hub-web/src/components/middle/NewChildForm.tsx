import { Button, Stack, TextInput, Text } from '@mantine/core'
import { useForm } from '@mantine/form'

type Props = {
    parentId: string
}

const NewChildForm = ({ parentId }: Props) => {
    const form = useForm({
        initialValues: {
            title: '',
            parentId: parentId,
        },
        validate: {
            title: (value) => (value.trim().length === 0 ? 'Title is required' : null),
        }
    })

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
    <Stack>
    <Text>{parentId}</Text>
      <TextInput
        label="Title"
        placeholder="Enter title"
        required
        withAsterisk
        key={form.key('title')}
        {...form.getInputProps('title')}
      />
      <Button type="submit">Add Child</Button>
    </Stack>
    </form>
  )
}

export default NewChildForm