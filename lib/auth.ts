import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { createUser } from './user'
import { userInsertSchema } from '@/db/schema'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn(params) {
      const validated = userInsertSchema.safeParse(params.user)

      if (validated.data) {
        await createUser(validated.data)
      }

      return true
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }

      return session
    },
  },
})
