import { Option } from 'effect'
import { User } from 'next-auth'
import Image from 'next/image'
import { ComponentProps, useActionState } from 'react'
import { updateUser } from './FormUser.actions'

type SessionUserDataProps = {
  data: User
}

function FormUserField({ children }: ComponentProps<'div'>) {
  return <div className="flex flex-col gap-2">{children}</div>
}

function FormUserInput(props: ComponentProps<'input'>) {
  return (
    <input type="text" className="p-1 px-2 rounded-lg text-sm" {...props} />
  )
}

export function FormUser({ data }: SessionUserDataProps) {
  const [, formAction, isPending] = useActionState(updateUser, undefined)

  return Option.fromNullable(data).pipe(
    Option.match({
      onNone: () => null,
      onSome: (data) => (
        <form action={formAction} className="flex flex-col gap-4 self-start">
          <input type="hidden" name="id" defaultValue={data.id} />

          {data.image && (
            <Image
              src={data.image}
              alt=""
              width={64}
              height={64}
              className="rounded-full"
            />
          )}

          <div className="flex flex-col gap-4 text-xs">
            <FormUserField>
              <label htmlFor="name">이름</label>
              <FormUserInput
                id="name"
                name="name"
                readOnly
                defaultValue={`${data.name}`}
              />
            </FormUserField>
            <FormUserField>
              <label htmlFor="email">이메일</label>
              <FormUserInput
                id="email"
                name="email"
                readOnly
                defaultValue={`${data.email}`}
              />
            </FormUserField>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="self-start rounded-lg p-1 font-medium hover:font-bold hover:shadow-lg bg-emerald-600"
          >
            저장
          </button>
        </form>
      ),
    })
  )
}
