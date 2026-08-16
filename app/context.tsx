'use client'

import { DEFAULT_TIMEZONE, TIMEZONE_COOKIE, TZName } from '@/lib/date'
import {
  createContext,
  PropsWithChildren,
  useEffect,
  useSyncExternalStore,
} from 'react'

export type TimezoneContextValue = {
  timezone?: TZName
}

/**
 * 기본값을 두는 것은 안전장치다. null 로 두면 provider 를 씌우지 않은 화면에서
 * 구조 분해가 그대로 터진다.
 */
export const TimezoneContext = createContext<TimezoneContextValue>({})

/** 1년 */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

/**
 * 타임존은 브라우저만 확실히 안다. 예전에는 서버가 루트 레이아웃에서
 * 쿠키·헤더를 읽어 내려보냈는데, 그 한 줄 때문에 트리 최상단이 요청 시점에
 * 묶여 어떤 라우트도 즉시 그릴 수 있는 셸을 가질 수 없었다.
 * (게다가 그 쿠키를 심는 곳이 어디에도 없어서 사실상 헛돌고 있었다.)
 *
 * 이제 브라우저가 직접 알아내고, 그 값을 쿠키에 남겨 서버 쪽 월 경계 계산
 * (`getServerTimezone`)이 쓰게 한다.
 *
 * `useSyncExternalStore` 를 쓰면 하이드레이션 때는 서버 스냅샷
 * (`DEFAULT_TIMEZONE`)으로 맞추고 그 뒤에 실제 값으로 넘어간다 —
 * 마운트 후 `setState` 로 흉내 내는 것과 달리 React 가 아는 방식이라
 * 어긋남 경고도, 불필요한 리렌더도 없다.
 */
/** 브라우저 타임존은 세션 중에 바뀌지 않으므로 구독할 것이 없다 */
const subscribe = () => () => {}

const getClientTimezone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE

const getServerSnapshot = () => DEFAULT_TIMEZONE

export function TimezoneProvider({ children }: PropsWithChildren) {
  const timezone = useSyncExternalStore(
    subscribe,
    getClientTimezone,
    getServerSnapshot
  )

  useEffect(() => {
    document.cookie = `${TIMEZONE_COOKIE}=${encodeURIComponent(
      timezone
    )}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
  }, [timezone])

  return (
    <TimezoneContext.Provider value={{ timezone }}>
      {children}
    </TimezoneContext.Provider>
  )
}
