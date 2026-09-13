import { AppShell } from './components/layout/AppShell'
import { ChildrenList } from './components/middle/ChildrenList'
import { Tree } from './components/tree/Tree'
import { DetailPane } from './components/right/DetailPane'

export default function App() {
  return (
    <AppShell
      left={<Tree />}
      middle={<ChildrenList />}
      right={<DetailPane />}
    />
  )
}