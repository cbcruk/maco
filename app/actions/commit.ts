'use server'

import { revalidatePath } from 'next/cache'
import { getMessageFromResponse } from '../helpers/getMessage'
import { createCommit } from '../lib/commit'
import { InitialActionState } from '../helpers/getInitialActionState'

export async function createCommitAction(
  _prevState: InitialActionState,
  formData: FormData
) {
  const response = await createCommit({
    emoji: formData.get('emoji') as string,
    message: formData.get('message') as string,
  })

  if (!response.ok) {
    return {
      data: null,
      errors: [getMessageFromResponse(response)],
    }
  }

  revalidatePath('/commit')

  return {
    data: `${response.status}`,
    errors: [],
  }
}
