import { CommitList } from './components/CommitList'
import { Session } from './components/Session'
import { CommitListServer } from './components/CommitList.server'
import { CommitListNav } from './components/CommitListNav'
import { TagFilterServer } from './components/TagFilter.server'
import { HomeProps } from './types'
import { getServerTimezone } from '@/lib/timezone'
import { TimezoneProvider } from './context'

async function Home({ searchParams }: HomeProps) {
  const { date, tag } = await searchParams
  const timezone = await getServerTimezone()

  return (
    <Session>
      {() => (
        <TimezoneProvider value={{ timezone }}>
          {!tag && <CommitListNav />}
          <TagFilterServer activeTag={tag} />
          <CommitListServer params={{ date, tag }}>
            {(data) => <CommitList list={data} />}
          </CommitListServer>
        </TimezoneProvider>
      )}
    </Session>
  )
}

export default Home
