'use client'

import { useMemo, useState } from 'react'
import { Link } from 'react-transition-progress/next'
import { CommitSchema } from '@/db/schema'
import { CommitFormReply } from '../commit/components/CommitFormReply'
import { CommitItem } from './CommitItem'
import { buildThreads, mergeOutbox } from './CommitList.utils'
import { useOutbox, useOutboxPrune } from './Outbox.hooks'

type CommitThreadProps = {
  /** 서버가 준 스레드 전체 (뿌리 + 답글의 최신 리비전) */
  list: CommitSchema[]
  rootNoteId: CommitSchema['root_note_id']
  userId: string
}

export function CommitThread({ list, rootNoteId, userId }: CommitThreadProps) {
  const outbox = useOutbox()
  const [targetNoteId, setTargetNoteId] = useState(rootNoteId)

  useOutboxPrune(list)

  const thread = useMemo(
    () =>
      buildThreads(mergeOutbox(list, outbox)).find(
        (candidate) => candidate.root.note_id === rootNoteId
      ),
    [list, outbox, rootNoteId]
  )

  if (!thread) {
    return <p className="p-4 text-gray-400">삭제된 메모입니다.</p>
  }

  const items = [thread.root, ...thread.replies]
  // 이어 쓰려던 메모가 사라졌으면 뿌리로 되돌린다.
  const target =
    items.find((item) => item.note_id === targetNoteId) ?? thread.root

  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <div
          key={item.note_id}
          className={item.depth > 0 ? 'pl-6 border-l border-gray-800 ml-4' : ''}
        >
          <CommitItem
            data={item}
            href={null}
            actions={
              item.pending ? null : (
                <div className="ml-auto flex items-center gap-3 text-[10px] text-gray-400">
                  <button
                    type="button"
                    className={
                      item.note_id === target.note_id
                        ? 'text-yellow-500'
                        : 'hover:text-gray-200'
                    }
                    onClick={() => setTargetNoteId(item.note_id)}
                  >
                    이어쓰기
                  </button>
                  <Link
                    prefetch
                    href={`/commit/${item.note_id}/amend`}
                    className="hover:text-gray-200"
                  >
                    수정
                  </Link>
                </div>
              )
            }
          />
        </div>
      ))}

      <CommitFormReply
        userId={userId}
        parent={target}
        rootNoteId={thread.root.note_id}
      />
    </div>
  )
}
