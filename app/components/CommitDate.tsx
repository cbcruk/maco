'use client'

import { useContext } from 'react'
import { DateFormatter, FormatDateParams, getTimezoneDate } from '@/lib/date'
import { ko } from 'date-fns/locale/ko'
import { TimezoneContext } from '../context'

type CommitDateProps = FormatDateParams

export function CommitDate({ date, formatStr }: CommitDateProps) {
  const { timezone } = useContext(TimezoneContext)
  const formattedDate = DateFormatter.formatDate({
    date: getTimezoneDate(new Date(date), timezone),
    formatStr,
    options: {
      locale: ko,
    },
  })

  return <>{formattedDate}</>
}
