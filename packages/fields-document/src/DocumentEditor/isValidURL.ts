import { sanitizeUrl } from '@braintree/sanitize-url'

export function isValidURL(url: string) {
  return url === sanitizeUrl(url)
}
