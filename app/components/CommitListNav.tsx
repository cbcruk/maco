'use client'

import { Link } from 'react-transition-progress/next'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { useCommitListNav } from './CommitListNav.hooks'

type CommitListNavBodyProps = ReturnType<typeof useCommitListNav>

function CommitListNavBody({
  currentMonth,
  prevMonth,
  nextMonth,
}: CommitListNavBodyProps) {
  return (
    <div className="flex justify-between items-center p-4">
      <div className="text-base">{currentMonth}</div>
      <div className="flex gap-4">
        <Link prefetch href={{ search: `date=${prevMonth}` }}>
          <ChevronLeftIcon />
        </Link>
        <Link prefetch href={{ search: `date=${nextMonth}` }}>
          <ChevronRightIcon />
        </Link>
      </div>
    </div>
  )
}

type CommitListNavContainerProps = {
  children: typeof CommitListNavBody
}

function CommitListNavContainer({ children }: CommitListNavContainerProps) {
  const { currentMonth, prevMonth, nextMonth } = useCommitListNav()

  return <>{children({ currentMonth, prevMonth, nextMonth })}</>
}

export function CommitListNav() {
  return <CommitListNavContainer>{CommitListNavBody}</CommitListNavContainer>
}
