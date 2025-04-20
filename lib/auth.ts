import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { userInsertSchema } from '@/db/schema'
import { Effect } from 'effect'
import { UserService } from '@/services/User'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({ user }) {
      return Effect.gen(function* () {
        const userService = yield* UserService
        const validatedFields = userInsertSchema
          .pick({
            id: true,
            name: true,
            email: true,
            image: true,
          })
          .safeParse(user)

        if (validatedFields.error) {
          return yield* Effect.fail(validatedFields.error)
        }

        yield* userService
          .findUserByEmail(validatedFields.data.email)
          .pipe(
            Effect.catchTag('NotFoundError', () =>
              userService.createUser(validatedFields.data)
            )
          )

        return true
      }).pipe(Effect.provide(UserService.Default), Effect.runPromise)
    },
    async session({ session }) {
      return await Effect.gen(function* () {
        const userService = yield* UserService

        yield* userService.findUserByEmail(session.user.email).pipe(
          Effect.matchEffect({
            onSuccess: (user) =>
              Effect.sync(() => {
                session.user.id = user.id
              }),
            onFailure: () => Effect.void,
          })
        )

        return session
      }).pipe(Effect.provide(UserService.Default), Effect.runPromise)
    },
  },
})
