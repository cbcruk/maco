'use client'

import { FormEvent } from 'react'
import { CommitSchema } from '@/db/schema'
import { replyRevision } from '@/lib/revision'
import { CommitForm } from './CommitForm'
import { parseCommitForm, useCommitWriter } from './CommitForm.hooks'
import { CommitView } from '@/app/components/CommitList.types'

type CommitFormReplyProps = {
  userId: string
  parent: CommitView
  rootNoteId: CommitSchema['root_note_id']
}

/**
 * 이어 쓰기. 새 메모를 만들되 `parent`에 매달아 둔다.
 *
 * 화면을 옮기지 않고 그 자리에 머문다 — 스레드를 읽으면서 이어 쓰는 흐름이라
 * 목록으로 튕겨 나가면 맥락이 끊긴다. 쓴 내용은 아웃박스에서 곧바로 스레드에
 * 겹쳐 보인다.
 */
export function CommitFormReply({
  userId,
  parent,
  rootNoteId,
}: CommitFormReplyProps) {
  const { write, errors, setErrors, isPending } = useCommitWriter()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget

    event.preventDefault()

    const parsed = parseCommitForm(form)

    if (!parsed.ok) {
      setErrors(parsed.errors)

      return
    }

    setErrors([])
    write(
      () => replyRevision({ user_id: userId, parent, ...parsed.value }),
      `/commit/${rootNoteId}`
    ).then(() => form.reset())
  }

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <p className="pb-2 text-[10px] text-gray-400">
        {parent.emoji} {parent.message.slice(0, 24)}
        {parent.message.length > 24 ? '…' : ''} 에 이어 씁니다
      </p>
      <CommitForm errors={errors} disabled={isPending} />
    </form>
  )
}
