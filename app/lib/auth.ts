import { getIronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'
import { createContentTypeHeaders } from '../helpers/createContentTypeHeaders'
import { createValTownUrl } from '../helpers/createValTownUrl'
import { UserSchema } from '../schema'

interface SessionData {
  id: number | null
  isLoggedIn: boolean
}

const defaultSession = {
  id: null,
  isLoggedIn: false,
} satisfies SessionData

const sessionOptions = {
  password: 'complex_password_at_least_32_characters_long',
  cookieName: '__session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
} satisfies SessionOptions

export async function getSession() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  )

  if (!session.isLoggedIn) {
    session.id = defaultSession.id
    session.isLoggedIn = defaultSession.isLoggedIn
  }

  return session
}

type LogInBody = Pick<UserSchema, 'email'> & {
  password: string
}

export async function login(body: LogInBody) {
  const url = createValTownUrl('/api/auth')
  const headers = createContentTypeHeaders()
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  })

  return response
}
