'use client'

import { createCommitAction } from '@/app/actions/commit'
import { Button } from '@/app/components/Button'
import { EmojiSelect } from '@/app/components/EmojiSelect'
import { ErrorMessage } from '@/app/components/ErrorMessage'
import { getInitialActionState } from '@/app/helpers/getInitialActionState'
import { useActionState } from 'react'

export function CommitForm() {
  const [state, formAction, isPending] = useActionState(
    createCommitAction,
    getInitialActionState()
  )

  return (
    <form action={formAction}>
      <fieldset disabled={isPending} className="flex flex-col gap-2 w-min">
        <EmojiSelect />
        <textarea
          name="message"
          className="w-full p-2 border rounded-lg text-xs"
          rows={4}
          cols={50}
          placeholder="메시지를 입력해 주세요"
          defaultValue=""
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
