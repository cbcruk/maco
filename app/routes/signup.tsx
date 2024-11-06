import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { createUser } from '~/lib/db.server'

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const formFieldset = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  const { error } = await createUser(
    formFieldset.name,
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

  return redirect('/signin')
}

export default function Signup() {
  return (
    <div>
      <Form method="post">
        <input name="name" type="text" />
        <input name="email" type="email" />
        <input name="password" type="password" />
        <button type="submit">submit</button>
      </Form>
    </div>
  )
}
