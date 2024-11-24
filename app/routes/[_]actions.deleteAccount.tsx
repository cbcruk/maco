import { ActionFunctionArgs, redirect } from 'react-router'
import { destroySession, getSession } from '~/lib/session.server'
import { deleteUser } from '~/lib/user.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'))
  const response = await deleteUser(session.get('_id'))

  if (!response.ok) {
    throw response
  }

  return redirect('/signup', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  })
}
