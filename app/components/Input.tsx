import type { ComponentProps } from 'react'

export function Input(props: ComponentProps<'input'>) {
  return <input className="p-2 border rounded-md text-xs" {...props} />
}
