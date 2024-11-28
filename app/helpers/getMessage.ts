export function getMessageFromResponse(response: Response) {
  return toMessage(`${response.status}`)
}

export function toMessage(message: string) {
  return {
    message,
  }
}

export type Message = ReturnType<typeof toMessage>
