import { Suspense } from 'react'
import { ResetPasswordForm } from './components/ResetPasswordForm'

function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}

export default ResetPassword
