'use client'

import { TZName } from '@/lib/date'
import { ComponentProps, createContext } from 'react'

export type TimezoneContextValue = {
  timezone?: TZName
}

/**
 * 기본값을 두는 것은 안전장치다. null 로 두면 provider 를 씌우지 않은 화면에서
 * 구조 분해가 그대로 터진다 — 실제로 상세 페이지에서 그렇게 깨졌다.
 * 값이 없으면 브라우저 로컬 타임존으로 떨어지는 편이 낫다.
 */
export const TimezoneContext = createContext<TimezoneContextValue>({})

export function TimezoneProvider(
  props: ComponentProps<typeof TimezoneContext.Provider>
) {
  return <TimezoneContext.Provider {...props} />
}
