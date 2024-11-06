import { ActionFunctionArgs, MetaFunction, redirect } from '@remix-run/node'
import { Form, Link, useActionData, useNavigation } from '@remix-run/react'

import LoaderIcon from '~/components/icons/LoaderIcon'

import { initiatePasswordReset } from '~/lib/db.server'
import { validateForm } from '~/lib/utils'

export const meta: MetaFunction = () => {
  return [
    { title: 'Forgot Password | Todo App' },
    {
      name: 'description',
      content: 'Recover your password to regain access to your account.',
    },
  ]
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const email = formData.get('email')

  const { error, data: token } = await initiatePasswordReset('eunsoo@email.com')

  if (error) {
    return {
      errors: {
        result: error,
      },
    }
  }

  return redirect(`/reset-password?token=${token}`)
}

export default function ForgotPassword() {
  const actionData = useActionData<typeof action>()

  return (
    <Form>
      <input name="email" type="text" />
      <button type="submit">submit</button>
    </Form>
  )
}
