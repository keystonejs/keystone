import { sanitizeUrl } from '@braintree/sanitize-url'

export function isValidURL(url: string) {
  return (
    url === sanitizeUrl(url) ||
    new URL(url, 'https://a').toString() === new URL(sanitizeUrl(url), 'https://a').toString()
  )
}
