import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  type MetaFunction,
} from '@remix-run/node'
import { useFetcher, useLoaderData, redirect } from '@remix-run/react'
import { getUser } from '~/lib/db.server'
import { getSession } from '~/sessions.server'

export const meta: MetaFunction = () => {
  return [{ title: 'ma-co 😸' }, { name: 'description', content: 'commit...' }]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'))

  if (!session.has('_id')) {
    throw redirect('/signin', {
      headers: {
        'Set-Cookie': '__session=; Max-Age=0',
      },
    })
  }

  const { error, data: user } = await getUser(session.get('_id') as string)

  if (error || !user) {
    throw redirect('/signin')
  }

  return json({
    todos: [],
    user,
  })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const { intent, ...values } = Object.fromEntries(formData)

  switch (intent) {
    case 'commit': {
      await fetch('http://localhost:3000/todos', {
        method: 'POST',
        body: JSON.stringify(values),
      })

      return json({
        ok: true,
      })
    }
    default: {
      throw new Response('Unknown intent', {
        status: 400,
      })
    }
  }
}

export default function Index() {
  const data = useLoaderData<typeof loader>()
  const fetcher = useFetcher()

  return (
    <div className="flex justify-center">
      <pre className="fixed bottom-2 right-2 p-2 text-xs border border-red-200 border-2 rounded-lg">
        {JSON.stringify(data, null, 2)}
      </pre>

      <fetcher.Form method="post">
        <fieldset className="flex gap-2 p-4">
          <textarea
            name="message"
            className="w-full p-2 border border-slate-700 rounded-lg text-xs"
            rows={2}
          />
          <button
            name="intent"
            value="commit"
            type="submit"
            className="p-2 rounded-lg bg-indigo-600 whitespace-nowrap text-xs"
          >
            commit
          </button>
        </fieldset>
      </fetcher.Form>
    </div>
  )
}
