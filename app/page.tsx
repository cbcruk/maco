import { login, logout } from './actions/auth'
import { getSession } from './lib/auth'

function Login() {
  return (
    <form action={login}>
      <input type="email" name="email" defaultValue="cbcruk@naver.com" />
      <input type="password" name="password" defaultValue="123qwe!@#" />
      <input type="submit" />
    </form>
  )
}

function Logout() {
  return (
    <form action={logout}>
      <button type="submit">logout</button>
    </form>
  )
}

export default async function Home() {
  const session = await getSession()

  return (
    <div>
      <Login />
      <Logout />
      <pre>{JSON.stringify(session)}</pre>
    </div>
  )
}
