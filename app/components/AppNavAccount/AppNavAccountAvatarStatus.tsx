import { ComponentProps } from 'react'

export function AppNavAccountAvatarStatus({
  children,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      className="flex items-center justify-center w-[24px] h-[24px] bg-gray-600 rounded-full overflow-hidden data-[active=true]:border border-gray-400"
      title="계정"
      {...props}
    >
      {children}
    </span>
  )
}
