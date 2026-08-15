'use client'

import { FormEvent } from 'react'
import { CommitSchema } from '@/db/schema'
import { amendRevision, tombstoneRevision } from '@/lib/revision'
import { CommitForm } from './CommitForm'
import { parseCommitForm, useCommitWriter } from './CommitForm.hooks'

type CommitFormEditProps = {
  userId: string
  current: CommitSchema
}

/**
 * 수정도 삭제도 기존 행을 건드리지 않는다. 같은 메모에 리비전을 하나 더 쌓고,
 * 그 부모로 지금 리비전의 해시를 가리킨다.
 */
export function CommitFormEdit({ userId, current }: CommitFormEditProps) {
  const { write, errors, setErrors, isPending } = useCommitWriter()
  const threadPath = `/commit/${current.root_note_id}`

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = parseCommitForm(event.currentTarget)

    if (!parsed.ok) {
      setErrors(parsed.errors)

      return
    }

    setErrors([])
    write(
      () => amendRevision({ user_id: userId, current, ...parsed.value }),
      threadPath
    )
  }

  function handleDelete() {
    if (!window.confirm('이 메모를 삭제할까요?')) {
      return
    }

    // 뿌리를 지우면 스레드가 통째로 사라지므로 목록으로 돌아간다.
    write(
      () => tombstoneRevision({ user_id: userId, current }),
      current.reply_to_note_id ? threadPath : '/'
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <CommitForm
        defaultValues={{ emoji: current.emoji, message: current.message }}
        errors={errors}
        disabled={isPending}
      >
        <button
          type="button"
          className="self-start text-[10px] text-gray-400 underline"
          onClick={handleDelete}
        >
          삭제
        </button>
      </CommitForm>
    </form>
  )
}
