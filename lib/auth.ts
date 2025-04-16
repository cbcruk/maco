import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { findUserByEmail } from './user'
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
          return yield* Effect.fail(new Error())
        }

        yield* userService
          .findUserByEmail(validatedFields.data.email)
          .pipe(
            Effect.flatMap((result) =>
              result.at(0)
                ? Effect.void
                : userService.createUser(validatedFields.data)
            )
          )
      }).pipe(
        Effect.provide(UserService.Default),
        Effect.match({
          onSuccess() {
            return true
          },
          onFailure() {
            return false
          },
        }),
        Effect.runPromise
      )
    },
    async session({ session }) {
      return Effect.gen(function* () {
        const userService = yield* UserService

        yield* userService.findUserByEmail(session.user.email).pipe(
          Effect.flatMap((result) => Effect.succeed(result.at(0))),
          Effect.tap((user) => {
            if (user) {
              session.user.id = user.id
            }
          })
        )

        return session
      }).pipe(Effect.provide(UserService.Default), Effect.runPromise)
    },
  },
})
