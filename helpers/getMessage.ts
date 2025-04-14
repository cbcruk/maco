import { ZodError } from 'zod'

export function getMessageFromResponse(response: Response) {
  return toMessage(`${response.status}`)
}

export function getMessageFromZodError(error: ZodError) {
  return toMessage(JSON.stringify(error.flatten().fieldErrors))
}

export function toMessage(message: string) {
  return {
    message,
  }
}

export type Message = ReturnType<typeof toMessage>
