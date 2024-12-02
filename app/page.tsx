import { getCommits } from './lib/commit'
import { CommitSchema } from './schema'
import { CommitList } from './components/CommitList'

async function Home() {
  const commitResponse = await getCommits()

  if (!commitResponse.ok) {
    return null
  }

  const data = (await commitResponse.json()) as CommitSchema[]

  return <CommitList list={data} />
}

export default Home
