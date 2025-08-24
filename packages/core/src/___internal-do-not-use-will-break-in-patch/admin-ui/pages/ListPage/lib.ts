// modified from https://github.com/vercel/next.js/blob/canary/packages/next/src/shared/lib/router/utils/querystring.ts#L35
import type { ParsedUrlQuery, ParsedUrlQueryInput } from 'querystring'

export function urlQueryToSearchParams(params: ParsedUrlQueryInput) {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, stringifyUrlQueryParam(item))
      }
    } else {
      searchParams.set(key, stringifyUrlQueryParam(value))
    }
  }
  return `?${searchParams.toString()}`
}

export function searchParamsToUrlQuery(searchParams: URLSearchParams): ParsedUrlQuery {
  const query: ParsedUrlQuery = {}
  for (const [key, value] of searchParams.entries()) {
    const existing = query[key]
    if (typeof existing === 'undefined') {
      query[key] = value
    } else if (Array.isArray(existing)) {
      existing.push(value)
    } else {
      query[key] = [existing, value]
    }
  }
  return query
}

function stringifyUrlQueryParam(param: unknown): string {
  if (typeof param === 'string') {
    return param
  }

  if ((typeof param === 'number' && !isNaN(param)) || typeof param === 'boolean') {
    return String(param)
  } else {
    return ''
  }
}
