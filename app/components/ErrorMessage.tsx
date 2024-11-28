import { ComponentProps } from 'react'
import { InitialActionState } from '../helpers/getInitialActionState'

type ErrorMessageProps = ComponentProps<'div'> &
  Pick<InitialActionState, 'errors'>

export function ErrorMessage({ errors }: ErrorMessageProps) {
  if (errors.length === 0) {
    return null
  }

  return (
    <p className="p-2 rounded-lg bg-red-400 text-white empty:none">
      {errors.map((error) => error.message).join()}
    </p>
  )
}
