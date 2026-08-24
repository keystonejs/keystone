// delete when we require node 26 or above which has the built-ins
export const toHex: (bytes: Uint8Array) => string =
  typeof Uint8Array.prototype.toHex === 'function'
    ? bytes => bytes.toHex()
    : bytes => {
        let str = ''
        for (const byte of bytes) {
          str += byte.toString(16).padStart(2, '0')
        }
        return str
      }

export const toBase64Url: (bytes: Uint8Array) => string =
  typeof Uint8Array.prototype.toBase64 === 'function'
    ? bytes => bytes.toBase64({ alphabet: 'base64url', omitPadding: true })
    : bytes => {
        const binString = Array.from(bytes, byte => String.fromCodePoint(byte)).join('')
        return btoa(binString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
      }
