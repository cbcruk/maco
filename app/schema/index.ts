/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/no-named-as-default */
import z from 'zod'

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  updated: z.string(),
  created: z.string(),
})

export type UserSchema = z.infer<typeof userSchema>

export const passwordSchema = z.object({
  salt: z.string(),
  hash: z.string(),
  token: z.string(),
  token_expire_at: z.string(),
  token_expiry_date: z.string(),
})

export type PasswordSchema = z.infer<typeof passwordSchema>

export const commitSchema = z.object({
  id: z.number(),
  emoji: z.string(),
  message: z.string(),
  updated: z.string(),
  created: z.string(),
})

export type CommitSchema = z.infer<typeof commitSchema>
