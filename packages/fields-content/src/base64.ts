export function base64UrlDecode(base64: string) {
  const binString = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(
    binString as Iterable<number>,
    m => (m as unknown as string).codePointAt(0)!
  )
}

export function base64UrlEncode(bytes: Uint8Array) {
  return base64Encode(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function base64Encode(bytes: Uint8Array) {
  const binString = Array.from(bytes, byte => String.fromCodePoint(byte)).join('')
  return btoa(binString)
}
