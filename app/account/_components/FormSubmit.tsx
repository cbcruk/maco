'use client'

import { ComponentProps } from 'react'
import { useFormStatus } from 'react-dom'

export function FormSubmit({ children }: ComponentProps<'div'>) {
  const status = useFormStatus()

  return (
    <button
      type="submit"
      className="font-medium text-sm underline underline-offset-4 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
      disabled={status.pending}
    >
      {children}
    </button>
  )
}
