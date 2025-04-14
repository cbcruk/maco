import NextAuth, { User } from 'next-auth'
import GitHub from 'next-auth/providers/github'

async function createUser(user: User) {
  console.log(user)
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({ user }) {
      await createUser(user)

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
