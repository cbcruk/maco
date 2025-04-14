'use client'

import { createCommitAction } from '@/app/commit/actions'
import { getInitialActionState } from '@/helpers/getInitialActionState'
import { PropsWithChildren, useActionState } from 'react'
import { CommitForm } from './CommitForm'

type CommitFormCreateProps = PropsWithChildren

export function CommitFormCreate({ children }: CommitFormCreateProps) {
  const [state, formAction, isPending] = useActionState(
    createCommitAction,
    getInitialActionState()
  )

  return (
    <form action={formAction}>
      {children}
      <CommitForm errors={state.errors} disabled={isPending} />
    </form>
  )
}
