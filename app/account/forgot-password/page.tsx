import { getUser } from '@/app/lib/user'
import { ForgotPasswordForm } from './components/ForgotPasswordForm'
import { getSession } from '@/app/lib/auth'

async function ForgotPassword() {
  const session = await getSession()

  if (!session.id) {
    return null
  }

  const userResponse = await getUser({ id: session.id })
  const user = await userResponse.json()

  return <ForgotPasswordForm email={user.email} />
}

export default ForgotPassword
