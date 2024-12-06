'use client'

import { createCommitAction } from '@/app/actions/commit'
import { getInitialActionState } from '@/app/helpers/getInitialActionState'
import { useActionState } from 'react'
import { CommitForm } from './CommitForm'

export function CommitFormCreate() {
  const [state, formAction, isPending] = useActionState(
    createCommitAction,
    getInitialActionState()
  )

  return (
    <form action={formAction}>
      <CommitForm errors={state.errors} disabled={isPending} />
    </form>
  )
}
