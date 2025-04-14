import { Message } from './getMessage'

export type InitialActionState = {
  data: string | null
  errors: Message[]
}

export function getInitialActionState() {
  return {
    data: null,
    errors: [],
  } as InitialActionState
}
