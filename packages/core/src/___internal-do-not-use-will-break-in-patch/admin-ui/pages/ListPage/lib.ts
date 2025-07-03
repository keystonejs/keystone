// Convert current query object to query string
export function toQueryParams(params: Record<string, string | null>) {
  const searchParams = new URLSearchParams()
  for (const key in params) {
    if (params[key] !== null && params[key] !== undefined) {
      searchParams.set(key, params[key] as string)
    }
  }
  return `?${searchParams.toString()}`
}
