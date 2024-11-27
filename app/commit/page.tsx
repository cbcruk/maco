import { getCommits } from '../lib/commit'
import { CommitForm } from './components/CommitForm'
import { CommitList } from './components/CommitList'

async function Commit() {
  const commitsResponse = await getCommits()
  const commits = await commitsResponse.json()

  return (
    <div className="p-4">
      <CommitForm />
      <CommitList items={commits} />
    </div>
  )
}

export default Commit
