import { ActionFunctionArgs, redirect } from '@remix-run/node'
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react'

import { updatePassword } from '~/lib/db.server'

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()

  const token = formData.get('token') as string
  const newPassword = formData.get('new-password') as string
  const confirmPassword = formData.get('confirm-password') as string

  const { error } = await updatePassword(token, newPassword)
  if (error) {
    return {
      errors: { result: error },
    }
  }

  return redirect('/signin')
}

export default function ResetPassword() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  return (
    <Form>
      <input type="hidden" name="token" value={token} />
      <input name="new-password" type="password" />
      <input name="confirm-password" type="password" />
    </Form>
  )
}
