'use client'

import { Button } from '@/app/components/Button'
import { EmojiSelect } from '@/app/components/EmojiSelect'
import { ErrorMessage } from '@/app/components/ErrorMessage'
import { ComponentProps } from 'react'
import { InitialActionState } from '@/app/helpers/getInitialActionState'
import { CommitSchema } from '@/app/actions/commit'

type CommitFormProps = {
  defaultValues?: CommitSchema
  errors: InitialActionState['errors']
} & ComponentProps<'fieldset'>

export function CommitForm({
  defaultValues,
  errors,
  children,
  ...props
}: CommitFormProps) {
  return (
    <fieldset className="flex flex-col gap-2" {...props}>
      {children}
      <EmojiSelect defaultValue={defaultValues?.emoji ?? undefined} />
      <textarea
        name="message"
        className="w-min max-w-[288px] p-2 border rounded-lg text-xs"
        rows={4}
        cols={50}
        placeholder="메시지를 입력해 주세요"
        defaultValue={defaultValues?.message ?? undefined}
      />
      <ErrorMessage errors={errors} />
      <div className="max-w-fit">
        <Button name="intent" value="commit" type="submit">
          저장
        </Button>
      </div>
    </fieldset>
  )
}
