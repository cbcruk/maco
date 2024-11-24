import { ActionFunctionArgs, MetaFunction, redirect, Form } from 'react-router'
import { resetPassword } from '~/lib/auth.server'

export const meta: MetaFunction = () => {
  return [
    { title: 'maco' },
    {
      name: 'description',
      content: '',
    },
  ]
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const response = await resetPassword({ email })

  if (!response.ok) {
    throw response
  }

  const token = await response.json()

  return redirect(`/reset-password?token=${token}`)
}

export default function ForgotPassword() {
  return (
    <Form method="POST">
      <input name="email" type="text" defaultValue="" />
      <button type="submit">submit</button>
    </Form>
  )
}
