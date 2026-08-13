'use client'

import { FormEvent } from 'react'
import { createRevision } from '@/lib/revision'
import { CommitForm } from './CommitForm'
import { parseCommitForm, useCommitWriter } from './CommitForm.hooks'

type CommitFormCreateProps = {
  userId: string
}

export function CommitFormCreate({ userId }: CommitFormCreateProps) {
  const { write, errors, setErrors, isPending } = useCommitWriter()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = parseCommitForm(event.currentTarget)

    if (!parsed.ok) {
      setErrors(parsed.errors)

      return
    }

    setErrors([])
    write(() => createRevision({ user_id: userId, ...parsed.value }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <CommitForm errors={errors} disabled={isPending} />
    </form>
  )
}
