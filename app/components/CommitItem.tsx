'use client'

import { Link } from 'react-transition-progress/next'
import { ReactNode } from 'react'
import { CommitDate } from './CommitDate'
import { CommitView } from './CommitList.types'

type CommitItemProps = {
  data: CommitView
  /** 없으면 링크로 감싸지 않는다 (스레드 뷰처럼 이미 그 자리에 있는 경우) */
  href?: string | null
  actions?: ReactNode
}

function CommitItemBody({ data: commit }: { data: CommitView }) {
  return (
    <>
      <span className="text-2xl">{commit.emoji}</span>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1 text-sm break-keep">
          {commit.message}
        </div>
        <div className="text-[10px] text-gray-400">
          <CommitDate date={commit.created} formatStr="aaa h시 m분" />
        </div>
      </div>
    </>
  )
}

const ITEM_CLASS_NAME =
  'flex gap-2 items-start p-4 py-2 border-b border-solid border-gray-900'

export function CommitItem({ data, href, actions }: CommitItemProps) {
  const target = href === undefined ? `/commit/${data.note_id}` : href

  // 아직 서버에 없는 메모는 상세로 갈 수 없다. 화면에는 다른 메모와 똑같이
  // 보이되 링크만 걸지 않는다.
  if (data.pending || !target || actions) {
    return (
      <div className={ITEM_CLASS_NAME}>
        <CommitItemBody data={data} />
        {actions}
      </div>
    )
  }

  return (
    <Link
      prefetch
      href={target}
      className={`${ITEM_CLASS_NAME} hover:bg-gray-900 transition-all`}
    >
      <CommitItemBody data={data} />
    </Link>
  )
}
