'use client'

import { createCommitAction } from '@/app/actions/commit'
import { Button } from '@/app/components/Button'
import { EmojiSelect } from '@/app/components/EmojiSelect'
import { ErrorMessage } from '@/app/components/ErrorMessage'
import { getInitialActionState } from '@/app/helpers/getInitialActionState'
import { ComponentProps, useActionState } from 'react'

type CommitFormProps = {
  formData?: FormData
} & ComponentProps<'fieldset'>

export function CommitForm({
  formData = new FormData(),
  children,
}: CommitFormProps) {
  const [state, formAction, isPending] = useActionState(
    createCommitAction,
    getInitialActionState()
  )

  return (
    <form action={formAction}>
      <fieldset disabled={isPending} className="flex flex-col gap-2">
        {children}
        <EmojiSelect
          defaultValue={(formData.get('emoji') as string) ?? undefined}
        />
        <textarea
          name="message"
          className="w-min max-w-[288px] p-2 border rounded-lg text-xs"
          rows={4}
          cols={50}
          placeholder="메시지를 입력해 주세요"
          defaultValue={(formData.get('message') as string) ?? undefined}
        />
        <ErrorMessage errors={state.errors} />
        <div className="max-w-fit">
          <Button
            name="intent"
            value="commit"
            type="submit"
            disabled={isPending}
          >
            저장
          </Button>
        </div>
      </fieldset>
    </form>
  )
}
