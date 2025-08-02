import { CommitList } from './components/CommitList'
import { Session } from './components/Session'
import { CommitListServer } from './components/CommitList.server'
import { CommitListNav } from './components/CommitListNav'
import { HomeProps } from './types'

async function Home({ searchParams }: HomeProps) {
  const { date } = await searchParams

  return (
    <Session>
      {() => (
        <>
          <CommitListNav />
          <CommitListServer params={{ date }}>
            {(data) => <CommitList list={data} />}
          </CommitListServer>
        </>
      )}
    </Session>
  )
}

export default Home
