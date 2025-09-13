'use client'

import { TZName } from '@/lib/date'
import { ComponentProps, createContext } from 'react'

export const TimezoneContext = createContext<{ timezone: TZName } | null>(null)

export function TimezoneProvider(
  props: ComponentProps<typeof TimezoneContext.Provider>
) {
  return <TimezoneContext.Provider {...props} />
}
