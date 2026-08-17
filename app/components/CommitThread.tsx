'use client'

import { useMemo, useState } from 'react'
import { Link } from 'react-transition-progress/next'
import { CommitSchema } from '@/db/schema'
import { CommitFormReply } from '../commit/components/CommitFormReply'
import { useCommitWriter } from '../commit/components/CommitForm.hooks'
import { tombstoneRevision } from '@/lib/revision'
import { CommitItem } from './CommitItem'
import { CommitView } from './CommitList.types'
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
  const { write, isPending } = useCommitWriter()

  useOutboxPrune(list)

  /**
   * 삭제도 리비전을 하나 더 쌓는 것이다(톰스톤). 뿌리를 지우면 스레드가
   * 통째로 사라지므로 목록으로 돌아가고, 답글이면 스레드에 머문다.
   */
  function handleDelete(item: CommitView) {
    if (!window.confirm('이 메모를 삭제할까요?')) {
      return
    }

    write(
      () => tombstoneRevision({ user_id: userId, current: item }),
      item.reply_to_note_id ? `/commit/${rootNoteId}` : '/'
    )
  }

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
                  <Link
                    prefetch
                    href={`/commit/${item.note_id}/history`}
                    className="hover:text-gray-200"
                  >
                    이력
                  </Link>
                  {/* 파괴적인 동작이라 가장 오른쪽 — 제일 자주 쓰는
                      "이어쓰기"에서 멀리 둔다. 평소엔 다른 항목과 같은
                      색이고 hover 때만 빨갛게 해 오탭을 줄인다. */}
                  <button
                    type="button"
                    disabled={isPending}
                    className="hover:text-red-400 disabled:opacity-50"
                    onClick={() => handleDelete(item)}
                  >
                    삭제
                  </button>
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
