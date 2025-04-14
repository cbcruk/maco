'use server'

import { revalidatePath } from 'next/cache'
import { getMessageFromZodError } from '../../helpers/getMessage'
import { createCommit, updateCommit } from '../../lib/commit'
import { InitialActionState } from '../../helpers/getInitialActionState'
import { commitSelectSchema } from '@/db/schema'

export async function createCommitAction(
  _prevState: InitialActionState,
  formData: FormData
) {
  const validatedFields = commitSelectSchema
    .pick({
      user_id: true,
      emoji: true,
      message: true,
    })
    .safeParse({
      user_id: formData.get('user_id'),
      emoji: formData.get('emoji'),
      message: formData.get('message'),
    })

  if (!validatedFields.success) {
    return {
      data: null,
      errors: [getMessageFromZodError(validatedFields.error)],
    }
  }

  const result = await createCommit(validatedFields.data)

  revalidatePath('/')
  revalidatePath('/commit')

  return {
    data: `${result.lastInsertRowid}`,
    errors: [],
  }
}

export async function updateCommitAction(
  _prevState: InitialActionState,
  formData: FormData
) {
  const validatedFields = commitSelectSchema
    .pick({
      id: true,
      emoji: true,
      message: true,
    })
    .safeParse({
      id: Number(formData.get('id')),
      emoji: formData.get('emoji'),
      message: formData.get('message'),
    })

  if (!validatedFields.success) {
    return {
      data: null,
      errors: [getMessageFromZodError(validatedFields.error)],
    }
  }

  await updateCommit(validatedFields.data)

  revalidatePath('/')
  revalidatePath('/commit')

  return {
    data: 'SUCCESS',
    errors: [],
  }
}
