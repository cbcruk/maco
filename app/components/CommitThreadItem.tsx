'use client'

import { Link } from 'react-transition-progress/next'
import { CommitItem } from './CommitItem'
import { CommitThread } from './CommitList.types'

/** 홈에서 뿌리 아래 펼쳐 보여줄 답글 수. 나머지는 스레드 뷰로 넘긴다 */
const VISIBLE_REPLIES = 3

type CommitThreadItemProps = {
  thread: CommitThread
}

export function CommitThreadItem({ thread }: CommitThreadItemProps) {
  const hiddenCount = thread.replies.length - VISIBLE_REPLIES
  const visible =
    hiddenCount > 0 ? thread.replies.slice(-VISIBLE_REPLIES) : thread.replies

  return (
    <div className="flex flex-col">
      <CommitItem data={thread.root} />

      {hiddenCount > 0 ? (
        <Link
          prefetch
          href={`/commit/${thread.root.note_id}`}
          className="pl-10 py-1 text-[10px] text-gray-400 hover:text-gray-200"
        >
          답글 {hiddenCount}개 더 보기
        </Link>
      ) : null}

      {/*
        깊이는 들여쓰기로 표현하되 시각적으로 1단계까지만 들여쓴다.
        개인 메모의 스레드가 깊어지는 일은 드물고, 계단이 깊어지면 좁은
        화면에서 읽기 어려워진다.
      */}
      {visible.map((reply) => (
        <div
          key={reply.note_id}
          className="pl-6 border-l border-solid border-gray-800 ml-4"
        >
          <CommitItem data={reply} />
        </div>
      ))}
    </div>
  )
}
