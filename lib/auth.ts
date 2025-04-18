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

        yield* userService.findUserByEmail(validatedFields.data.email)
      }).pipe(
        Effect.provide(UserService.Default),
        Effect.match({
          onSuccess: () => true,
          onFailure: () => false,
        }),
        Effect.runPromise
      )
    },
    async session({ session }) {
      return Effect.gen(function* () {
        const userService = yield* UserService

        yield* userService.findUserByEmail(session.user.email).pipe(
          Effect.match({
            onSuccess(user) {
              session.user.id = user.id
            },
            onFailure: () => Effect.void,
          })
        )

        return session
      }).pipe(Effect.provide(UserService.Default), Effect.runPromise)
    },
  },
})
