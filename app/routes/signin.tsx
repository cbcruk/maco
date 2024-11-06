import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { authenticateUser } from '~/lib/db.server'
import { commitSession, getSession } from '~/sessions.server'

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const formFieldset = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  const { error, data: id } = await authenticateUser(
    formFieldset.email,
    formFieldset.password
  )

  if (error) {
    return {
      errors: {
        result: error,
      },
    }
  }

  const session = await getSession(request.headers.get('Cookie'))

  if (!id) {
    return
  }

  session.set('_id', id)

  return redirect('/', {
    headers: { 'Set-Cookie': await commitSession(session) },
  })
}

export default function Signin() {
  return (
    <div>
      <Form method="post">
        <input type="email" name="email" defaultValue="eunsoo@email.com" />
        <input type="password" name="password" defaultValue="123qwe!@#" />
        <button type="submit">submit</button>
      </Form>
    </div>
  )
}
