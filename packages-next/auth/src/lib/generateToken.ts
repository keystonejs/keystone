import { randomBytes } from 'crypto';

export function generateToken(length: number): string {
  return randomBytes(length)
    .toString('base64')
    .slice(0, length)
    .replace(/[^a-zA-Z0-9]/g, '');
}
