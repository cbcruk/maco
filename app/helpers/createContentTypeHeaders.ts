export function createContentTypeHeaders() {
  const headers = new Headers()

  headers.set('Content-Type', 'application/json')

  return headers
}
