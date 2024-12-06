'use server'

import { revalidatePath } from 'next/cache'
import {
  getMessageFromResponse,
  getMessageFromZodError,
} from '../helpers/getMessage'
import { createCommit, updateCommit } from '../lib/commit'
import { InitialActionState } from '../helpers/getInitialActionState'
import { z } from 'zod'

const schema = z.object({
  emoji: z.string(),
  message: z.string(),
})

export type CommitSchema = z.infer<typeof schema>

export async function createCommitAction(
  _prevState: InitialActionState,
  formData: FormData
) {
  const validatedFields = schema.safeParse({
    emoji: formData.get('emoji'),
    message: formData.get('message'),
  })

  if (!validatedFields.success) {
    return {
      data: null,
      errors: [getMessageFromZodError(validatedFields.error)],
    }
  }

  const response = await createCommit({
    emoji: validatedFields.data.emoji,
    message: validatedFields.data.message,
  })

  if (!response.ok) {
    return {
      data: null,
      errors: [getMessageFromResponse(response)],
    }
  }

  revalidatePath('/')
  revalidatePath('/commit')

  return {
    data: `${response.status}`,
    errors: [],
  }
}

export async function updateCommitAction(
  _prevState: InitialActionState,
  formData: FormData
) {
  const validatedFields = schema.safeParse({
    emoji: formData.get('emoji'),
    message: formData.get('message'),
  })

  if (!validatedFields.success) {
    return {
      data: null,
      errors: [getMessageFromZodError(validatedFields.error)],
    }
  }

  const id = formData.get('id') as string
  const response = await updateCommit(id, {
    emoji: formData.get('emoji') as string,
    message: formData.get('message') as string,
  })

  if (!response.ok) {
    return {
      data: null,
      errors: [getMessageFromResponse(response)],
    }
  }

  revalidatePath('/')
  revalidatePath('/commit')

  return {
    data: `${response.status}`,
    errors: [],
  }
}
