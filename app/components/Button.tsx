import type { ComponentProps } from 'react'

export function Button({ children, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="submit"
      className="p-1.5 rounded-md bg-emerald-600 text-xs text-emerald-50 hover:bg-emerald-700 hover:text-emerald-100 hover:font-bold disabled:opacity-50"
      {...props}
    >
      {children}
    </button>
  )
}
