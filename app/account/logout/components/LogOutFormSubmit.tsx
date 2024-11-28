'use client'

import { Button } from '@/app/components/Button'
import { useFormStatus } from 'react-dom'

export function LogOutFormSubmit() {
  const status = useFormStatus()

  return (
    <Button type="submit" disabled={status.pending}>
      로그아웃
    </Button>
  )
}
