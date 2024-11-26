import { getIronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  id: number | null
  isLoggedIn: boolean
}

export const defaultSession: SessionData = {
  id: null,
  isLoggedIn: false,
}

export const sessionOptions: SessionOptions = {
  password: 'complex_password_at_least_32_characters_long',
  cookieName: '__session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

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
