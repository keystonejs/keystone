import type { KeystoneListsAPI } from '@keystone-next/types';
import { PasswordAuthErrorCode } from '../types';
import { findMatchingIdentity } from './findMatchingIdentity';

export async function validateSecret(
  list: any,
  identityField: string,
  identity: string,
  secretField: string,
  protectIdentities: boolean,
  secret: string,
  itemAPI: KeystoneListsAPI<any>[string]
): Promise<
  | { success: false; code: PasswordAuthErrorCode }
  | { success: true; item: { id: any; [prop: string]: any } }
> {
  const match = await findMatchingIdentity(identityField, identity, itemAPI);
  // Identity failures with helpful errors
  let code: PasswordAuthErrorCode | undefined;
  if (!match.success) {
    code = match.code;
  } else if (!match.item[secretField]) {
    code = 'SECRET_NOT_SET';
  }

  const secretFieldInstance = list.fieldsByPath[secretField];
  if (code) {
    // See "Identity Protection" in the README as to why this is a thing
    if (protectIdentities) {
      await secretFieldInstance.generateHash('simulated-password-to-counter-timing-attack');
      code = 'FAILURE';
    }
    return { success: false, code };
  }

  const { item } = match as { success: true; item: { id: any; [prop: string]: any } };
  if (await secretFieldInstance.compare(secret, item[secretField])) {
    // Authenticated!
    return { success: true, item };
  } else {
    return { success: false, code: protectIdentities ? 'FAILURE' : 'SECRET_MISMATCH' };
  }
}
