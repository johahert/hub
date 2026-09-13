import { useState, type FormEvent } from 'react'
import { useCreateChildNode } from '../../api/nodes'
import type { NodeType } from '../../api/types'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

type Props = {
    parentId: string
    parentType: NodeType
}

const NewChildForm = ({ parentId, parentType }: Props) => {
    const [title, setTitle] = useState('')
    const createChild = useCreateChildNode(parentId, parentType)

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        const trimmed = title.trim()
        if (!trimmed) return
        createChild.mutate(trimmed)
        setTitle('')
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="New title"
                required
                className="flex-1"
            />
            <Button type="submit" disabled={createChild.isPending || !title.trim()}>
                Add
            </Button>
        </form>
    )
}

export default NewChildForm
