import type { KeystoneDbAPI } from '@keystone-next/types';
import { PasswordAuthErrorCode, SecretFieldImpl } from '../types';
import { findMatchingIdentity } from './findMatchingIdentity';

export async function validateSecret(
  secretFieldImpl: SecretFieldImpl,
  identityField: string,
  identity: string,
  secretField: string,
  protectIdentities: boolean,
  secret: string,
  dbItemAPI: KeystoneDbAPI<any>[string]
): Promise<
  | { success: false; code: PasswordAuthErrorCode }
  | { success: true; item: { id: any; [prop: string]: any } }
> {
  const match = await findMatchingIdentity(identityField, identity, dbItemAPI);
  // Identity failures with helpful errors
  let code: PasswordAuthErrorCode | undefined;
  if (!match.success) {
    code = match.code;
  } else if (!match.item[secretField]) {
    code = 'SECRET_NOT_SET';
  }

  if (code) {
    // See "Identity Protection" in the README as to why this is a thing
    if (protectIdentities) {
      await secretFieldImpl.generateHash('simulated-password-to-counter-timing-attack');
      code = 'FAILURE';
    }
    return { success: false, code };
  }

  const { item } = match as { success: true; item: { id: any; [prop: string]: any } };
  if (await secretFieldImpl.compare(secret, item[secretField])) {
    // Authenticated!
    return { success: true, item };
  } else {
    return { success: false, code: protectIdentities ? 'FAILURE' : 'SECRET_MISMATCH' };
  }
}
