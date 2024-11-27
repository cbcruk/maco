import { revalidatePath } from 'next/cache'
import { getSession } from '../lib/auth'

export async function logout() {
  'use server'

  const session = await getSession()

  session.destroy()

  revalidatePath('/')
}
