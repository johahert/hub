import { Loader, Stack, Text } from '@mantine/core'
import { useRootNodes } from '../../api/nodes'
import { TreeNode } from './TreeNode'

export function Tree() {
    const { data, isLoading, error } = useRootNodes();

    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        return <Text color="red">Error loading tree</Text>;
    }
    if (!data?.length) return <Text c="dimmed" size="sm">No projects yet</Text>
    return (
        <Stack>
            {data?.map(node => (
                <TreeNode key={node.id} node={node} />
            ))}
        </Stack>
    );
}