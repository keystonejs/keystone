import { randomBytes } from 'crypto';

export function generateToken(length: number): string {
  return randomBytes(length) // Generates N*8 bits of data
    .toString('base64') // Groups by 6-bits and encodes as ascii chars in [A-Za-z0-9+/] and '=' for padding (~8/6 * N chars)
    .replace(/[^a-zA-Z0-9]/g, '') // Removes any '+', '/' (62, 63) and '=' chars as often require escaping (eg. in urls)
    .slice(0, length); // Shortens the string, so we now have ~6*N bits of data (it's actually log2(62)*N = 5.954*N)
}
