import type { IncomingMessage, ServerResponse } from 'node:http'

export function headersFromRequest(req: IncomingMessage) {
  return new Headers(
    Object.entries(req.headers).flatMap(([key, value]): [string, string][] => {
      if (value === undefined) return []
      return Array.isArray(value) ? value.map(inner => [key, inner]) : [[key, value]]
    })
  )
}

export function addHeadersToResponse(headers: Headers, res: ServerResponse) {
  for (const [name, value] of headers) {
    if (name !== 'set-cookie') res.setHeader(name, value)
  }

  const cookies = headers.getSetCookie()
  if (!cookies.length) return

  // keep cookies already set on the response, e.g. by middleware in server.extendExpressApp.
  // headers can be copied more than once (once per operation in a batch), so skip duplicates
  const existing = res.getHeader('set-cookie')
  const existingCookies =
    existing === undefined ? [] : Array.isArray(existing) ? existing : [String(existing)]
  res.setHeader('set-cookie', [...new Set([...existingCookies, ...cookies])])
}
