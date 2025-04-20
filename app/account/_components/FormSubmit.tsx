'use client'

import { merge } from '@/lib/classNames'
import { ComponentProps } from 'react'
import { useFormStatus } from 'react-dom'

export function FormSubmit({ children, className }: ComponentProps<'div'>) {
  const status = useFormStatus()

  return (
    <button
      type="submit"
      className={merge(
        'cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed',
        className
      )}
      disabled={status.pending}
    >
      {children}
    </button>
  )
}
