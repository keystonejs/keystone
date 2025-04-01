import type { IncomingHttpHeaders } from 'node:http'

export function nodeHeadersToHeaders(headers: IncomingHttpHeaders) {
  return new Headers(
    Object.entries(headers).flatMap(([key, value]): [string, string][] =>
      value ? (Array.isArray(value) ? value.map(inner => [key, inner]) : [[key, value]]) : []
    )
  )
}
