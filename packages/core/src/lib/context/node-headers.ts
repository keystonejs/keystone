import type { IncomingMessage, ServerResponse } from 'node:http'

export function headersFromRequest(req: IncomingMessage) {
  return new Headers(
    Object.entries(req.headers).flatMap(([key, value]): [string, string][] =>
      value ? (Array.isArray(value) ? value.map(inner => [key, inner]) : [[key, value]]) : []
    )
  )
}

export function addHeadersToResponse(headers: Headers, res: ServerResponse) {
  for (const [name, value] of headers) {
    if (name !== 'set-cookie') res.setHeader(name, value)
  }

  const cookies = headers.getSetCookie()
  if (cookies.length) res.setHeader('set-cookie', cookies)
}
