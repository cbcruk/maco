import type { ComponentProps } from 'react'

export function Input(props: ComponentProps<'input'>) {
  return <input className="p-2 w-min border rounded-md text-xs" {...props} />
}
