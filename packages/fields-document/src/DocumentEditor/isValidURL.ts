import { sanitizeUrl } from '@braintree/sanitize-url'

export function isValidURL(url: string) {
  return url === sanitizeUrl(url) || url === new URL(sanitizeUrl(url)).toString()
}
