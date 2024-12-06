'use client'

import { updateCommitAction } from '@/app/actions/commit'
import { getInitialActionState } from '@/app/helpers/getInitialActionState'
import { ComponentProps, useActionState } from 'react'
import { CommitForm } from './CommitForm'

type CommitFormEditProps = Pick<
  ComponentProps<typeof CommitForm>,
  'defaultValues' | 'children'
>

export function CommitFormEdit({
  defaultValues,
  children,
}: CommitFormEditProps) {
  const [state, formAction, isPending] = useActionState(
    updateCommitAction,
    getInitialActionState()
  )

  return (
    <form action={formAction}>
      <CommitForm
        defaultValues={defaultValues}
        errors={state.errors}
        disabled={isPending}
      >
        {children}
      </CommitForm>
    </form>
  )
}
