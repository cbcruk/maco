'use client'

import { updateCommitAction } from "@/app/actions/commit"
import { getInitialActionState } from "@/app/helpers/getInitialActionState"
import { ComponentProps, useActionState } from "react"
import { CommitForm } from "./CommitForm"


type CommitFormEditProps = Pick<ComponentProps<typeof CommitForm>, 'formData'>

export function CommitFormEdit({ formData }: CommitFormEditProps) {
  const actionState = useActionState(
    updateCommitAction,
    getInitialActionState()
  )

  return (
    <CommitForm actionState={actionState} formData={formData}>
      <input type="hidden" name="id" defaultValue={id} />
    </CommitForm>
  )
}