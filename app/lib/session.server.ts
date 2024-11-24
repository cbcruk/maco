import { createCookieSessionStorage } from 'react-router'

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: '__session',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      secrets: [
        process.env.SESSION_SECRET_CURRENT ?? '',
        process.env.SESSION_SECRET_PREVIOUS ?? '',
        process.env.SESSION_SECRET_OLD ?? '',
      ],
      secure: process.env.NODE_ENV === 'production',
    },
  })

export { getSession, commitSession, destroySession }
