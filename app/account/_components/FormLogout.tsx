'use client'

import { signOut } from 'next-auth/react'
import { PropsWithChildren, useActionState } from 'react'
import { clearOutbox, getOutboxSnapshot, loadOutbox } from '@/lib/outbox'
import { clearDeviceState } from '@/lib/device'
import { flushOutbox } from '@/lib/sync'

/**
 * 로그아웃 전에 남은 리비전을 먼저 올리고 로컬 저장소를 비운다.
 * 공용 기기에 남으면 그대로 정보 유출이다.
 */
async function signOutAndClear(): Promise<null> {
  await loadOutbox()
  await flushOutbox()

  const remaining = getOutboxSnapshot()

  if (
    remaining.length > 0 &&
    !window.confirm(
      `아직 올리지 못한 메모가 ${remaining.length}개 있습니다. 로그아웃하면 이 기기에서 사라집니다. 계속할까요?`
    )
  ) {
    return null
  }

  await clearOutbox()
  clearDeviceState()

  await signOut()

  return null
}

export function FormLogout({ children }: PropsWithChildren) {
  const [, formAction] = useActionState(signOutAndClear, null)

  return <form action={formAction}>{children}</form>
}
