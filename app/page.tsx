import { CommitList } from './components/CommitList'
import { Session } from './components/Session'
import { CommitListServer } from './components/CommitList.server'
import { CommitListNav } from './components/CommitListNav'
import { TagFilterServer } from './components/TagFilter.server'
import { ActivityHeatmapServer } from './components/ActivityHeatmap.server'
import { SearchBox } from './components/SearchBox'
import { HomeProps } from './types'
import { getServerTimezone } from '@/lib/timezone'
import { TimezoneProvider } from './context'

async function Home({ searchParams }: HomeProps) {
  const { date, tag, q } = await searchParams
  const timezone = await getServerTimezone()
  const isFiltered = Boolean(tag || q)

  return (
    <Session>
      {() => (
        <TimezoneProvider value={{ timezone }}>
          {!isFiltered && <ActivityHeatmapServer />}
          {!isFiltered && <CommitListNav />}
          <SearchBox defaultValue={q} />
          <TagFilterServer activeTag={tag} />
          <CommitListServer params={{ date, tag, q }}>
            {(data) => <CommitList list={data} />}
          </CommitListServer>
        </TimezoneProvider>
      )}
    </Session>
  )
}

export default Home
