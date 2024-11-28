import { logoutAction } from '@/app/actions/auth'
import { LogOutFormSubmit } from './components/LogOutFormSubmit'

function Logout() {
  return (
    <form action={logoutAction}>
      <LogOutFormSubmit />
    </form>
  )
}

export default Logout
