import * as PopoverPrimitive from '@radix-ui/react-popover'
import { ComponentProps } from 'react'

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger

export const PopoverContent = ({
  children,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content sideOffset={5} {...props}>
      {children}
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
)

PopoverContent.displayName = 'PopoverContent'
