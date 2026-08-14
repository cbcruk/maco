'use client'

import { Link } from 'react-transition-progress/next'
import { PropsWithChildren, ReactNode } from 'react'
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

function CommitItemStatic({ children }: PropsWithChildren) {
  return <div className={ITEM_CLASS_NAME}>{children}</div>
}

export function CommitItem({ data, href, actions }: CommitItemProps) {
  const target = href === undefined ? `/commit/${data.note_id}` : href

  // 아직 서버에 없으면 상세로 갈 수 없다.
  if (data.pending || !target) {
    return (
      <div className={data.pending ? 'opacity-60' : undefined}>
        <CommitItemStatic>
          <CommitItemBody data={data} />
          {actions}
        </CommitItemStatic>
      </div>
    )
  }

  if (actions) {
    return (
      <CommitItemStatic>
        <CommitItemBody data={data} />
        {actions}
      </CommitItemStatic>
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
