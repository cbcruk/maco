'use client'

import { Button } from '@/app/components/Button'
import { EmojiSelect } from '@/app/components/EmojiSelect'
import { createCommit } from '@/app/lib/commit'
import { useActionState } from 'react'

export function CommitForm() {
  const [, formAction, isPending] = useActionState(createCommit, {
    message: '',
  })

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
        <Button name="intent" value="commit" type="submit" disabled={isPending}>
          커밋
        </Button>
      </fieldset>
    </form>
  )
}
