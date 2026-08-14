'use client'

import { Link } from 'react-transition-progress/next'
import { PropsWithChildren } from 'react'
import { CommitDate } from './CommitDate'
import { CommitView } from './CommitList.types'

type CommitItemProps = {
  data: CommitView
}

function CommitItemBody({ data: commit }: CommitItemProps) {
  return (
    <>
      <span className="text-2xl">{commit.emoji}</span>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1 text-sm break-keep">
          {commit.message}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <CommitDate date={commit.created} formatStr="aaa h시 m분" />
          {commit.pending ? (
            <span
              title="이 기기에만 저장되어 있습니다. 연결되면 자동으로 올라갑니다."
              className="text-yellow-500"
            >
              · 대기 중
            </span>
          ) : null}
        </div>
      </div>
    </>
  )
}

const ITEM_CLASS_NAME =
  'flex gap-2 items-start p-4 py-2 border-b border-solid border-gray-900'

function CommitItemPending({ children }: PropsWithChildren) {
  // 아직 서버에 없으므로 상세 화면으로 갈 수 없다.
  return <div className={`${ITEM_CLASS_NAME} opacity-60`}>{children}</div>
}

export function CommitItem({ data }: CommitItemProps) {
  if (data.pending) {
    return (
      <CommitItemPending>
        <CommitItemBody data={data} />
      </CommitItemPending>
    )
  }

  return (
    <Link
      prefetch
      href={`/commit/${data.note_id}`}
      className={`${ITEM_CLASS_NAME} hover:bg-gray-900 transition-all`}
    >
      <CommitItemBody data={data} />
    </Link>
  )
}
