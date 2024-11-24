import { formatDistanceToNow } from 'date-fns'
import { useEffect, useRef } from 'react'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  type MetaFunction,
} from 'react-router'
import { useFetcher, useLoaderData, redirect } from 'react-router'
import { Button } from '~/components/Button'
import { EmojiSelect } from '~/components/EmojiSelect'
import { createCommit, getCommits } from '~/lib/commit.server'
import { getSession } from '~/lib/session.server'
import { getUser } from '~/lib/user.server'
import { CommitSchema } from '~/schema'

export const meta: MetaFunction = () => {
  return [
    { title: '쓰기 | maco' },
    {
      name: 'description',
      content: '',
    },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'))

  if (!session.has('_id')) {
    const headers = new Headers()
    headers.set('Set-Cookie', '__session=; Max-Age=0')

    throw redirect('/signin', {
      headers,
    })
  }

  const sessionId = session.get('_id')

  const userResponse = await getUser({
    id: sessionId,
  })

  if (!userResponse.ok) {
    throw redirect('/signin')
  }

  const commitsResponse = await getCommits({
    id: sessionId,
  })

  if (!commitsResponse.ok) {
    throw commitsResponse
  }

  return {
    commits: (await commitsResponse.json()) as CommitSchema[],
  }
}

type FormSchema = Omit<CommitSchema, 'id'> & {
  intent: 'commit' | undefined
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'))
  const formData = await request.formData()
  const { intent, message, emoji } = Object.fromEntries(formData) as FormSchema

  switch (intent) {
    case 'commit': {
      const response = await createCommit({
        message,
        emoji,
        user_id: session.get('_id'),
      })

      if (!response.ok) {
        throw response
      }

      return {
        ok: true,
      }
    }
    default: {
      throw new Response(null, {
        status: 400,
      })
    }
  }
}

export default function Commit() {
  const fetcher = useFetcher<typeof action>()
  const { commits } = useLoaderData<typeof loader>()
  const isSubmitting = fetcher.state === 'submitting'
  const $form = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.ok) {
      $form.current?.reset()
    }
  }, [fetcher.data, fetcher.state])

  return (
    <div className="flex flex-col gap-4">
      <fetcher.Form ref={$form} method="post">
        <fieldset disabled={isSubmitting} className="flex flex-col gap-2 w-min">
          <EmojiSelect />
          <textarea
            name="message"
            className="w-full p-2 border rounded-lg text-xs"
            rows={4}
            cols={50}
            placeholder="메시지를 입력해 주세요"
            defaultValue=""
          />
          <Button
            name="intent"
            value="commit"
            type="submit"
            disabled={isSubmitting}
          >
            커밋
          </Button>
        </fieldset>
      </fetcher.Form>
      <div className="flex flex-col gap-2 w-min max-h-[300px] overflow-auto p-2 rounded-lg bg-neutral-900">
        {commits.map((commit) => (
          <div key={commit.id} className="flex items-start gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{commit.emoji}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-100 text-xs">{commit.message}</span>
              <span
                className="text-slate-200 text-[10px]"
                title={commit.created}
              >
                {formatDistanceToNow(new Date(commit.created), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
