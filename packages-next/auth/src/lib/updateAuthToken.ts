import type { KeystoneListsAPI } from '@keystone-next/types';
import { randomBytes } from 'crypto';
import { AuthTokenRequestErrorCode } from '../types';
import { findMatchingIdentity } from './findMatchingIdentity';

function generateToken(length: number): string {
  return randomBytes(length) // Generates N*8 bits of data
    .toString('base64') // Groups by 6-bits and encodes as ascii chars in [A-Za-z0-9+/] and '=' for padding (~8/6 * N chars)
    .replace(/[^a-zA-Z0-9]/g, '') // Removes any '+', '/' (62, 63) and '=' chars as often require escaping (eg. in urls)
    .slice(0, length); // Shortens the string, so we now have ~6*N bits of data (it's actually log2(62)*N = 5.954*N)
}

// TODO: Auth token mutations may leak user identities due to timing attacks :(
// We don't (currently) make any effort to mitigate the time taken to record the new token or sent the email when successful
export async function updateAuthToken(
  identityField: string,
  protectIdentities: boolean,
  identity: string,
  itemAPI: KeystoneListsAPI<any>[string]
): Promise<
  | { success: false; code?: AuthTokenRequestErrorCode }
  | { success: true; itemId: string | number; token: string }
> {
  const match = await findMatchingIdentity(identityField, identity, itemAPI);
  // Identity failures with helpful errors (unless it would violate our protectIdentities config)
  if (match.success) {
    return { success: true, itemId: match.item.id, token: generateToken(20) };
  } else {
    // There is no generic `AUTH_TOKEN_REQUEST_FAILURE` code; it's existance would alow values in the identity field to be probed
    return { success: false, code: protectIdentities ? undefined : match.code };
  }
}
