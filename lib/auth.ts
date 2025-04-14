import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { createUser, findUserByEmail } from './user'
import { userInsertSchema } from '@/db/schema'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({ user }) {
      const validatedFields = userInsertSchema
        .pick({
          id: true,
          name: true,
          email: true,
          image: true,
        })
        .safeParse(user)

      if (!validatedFields.error) {
        const result = await findUserByEmail(validatedFields.data.email)

        if (!result) {
          await createUser(validatedFields.data)
        }
      }

      return true
    },
    async session({ session }) {
      const user = await findUserByEmail(session.user.email)

      if (user?.id) {
        session.user.id = user.id
      }

      return session
    },
  },
})
