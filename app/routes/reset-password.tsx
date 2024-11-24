import {
  ActionFunctionArgs,
  redirect,
  Form,
  useSearchParams,
} from 'react-router'
import { updatePassword } from '~/lib/auth.server'

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const token = formData.get('token') as string
  const newPassword = formData.get('new-password') as string
  const response = await updatePassword({
    token,
    password: newPassword,
  })

  if (!response.ok) {
    throw response
  }

  return redirect('/signin')
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  return (
    <Form method="POST">
      <input type="hidden" name="token" value={token} />
      <input name="new-password" type="password" />
      <input name="confirm-password" type="password" />

      <button type="submit">submit</button>
    </Form>
  )
}
