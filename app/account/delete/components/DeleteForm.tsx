'use client'

import { deleteUserAction } from '@/app/actions/user'
import { Button } from '@/app/components/Button'
import { getInitialActionState } from '@/app/helpers/getInitialActionState'
import { useActionState } from 'react'

export function DeleteForm() {
  const [, formAction, isPending] = useActionState(
    deleteUserAction,
    getInitialActionState()
  )

  return (
    <form action={formAction}>
      <fieldset disabled={isPending}>
        <Button type="submit" data-variant="danger">
          완료
        </Button>
      </fieldset>
    </form>
  )
}
