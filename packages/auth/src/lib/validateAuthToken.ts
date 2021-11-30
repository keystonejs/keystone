import type { KeystoneDbAPI } from '@keystone-6/core/types';
import { AuthTokenRedemptionErrorCode, SecretFieldImpl } from '../types';
import { validateSecret } from './validateSecret';

// The tokensValidForMins config is from userland so could be anything; make it sane
function sanitiseValidForMinsConfig(input: any): number {
  const parsed = Number.parseFloat(input);
  // > 10 seconds, < 24 hrs, default 10 mins
  return parsed ? Math.max(1 / 6, Math.min(parsed, 60 * 24)) : 10;
}

export async function validateAuthToken(
  listKey: string,
  secretFieldImpl: SecretFieldImpl,
  tokenType: 'passwordReset' | 'magicAuth',
  identityField: string,
  identity: string,
  tokenValidMins: number | undefined,
  token: string,
  dbItemAPI: KeystoneDbAPI<any>[string]
): Promise<
  | { success: false; code: AuthTokenRedemptionErrorCode }
  | { success: true; item: { id: any; [prop: string]: any } }
> {
  const result = await validateSecret(
    secretFieldImpl,
    identityField,
    identity,
    `${tokenType}Token`,
    token,
    dbItemAPI
  );
  if (!result.success) {
    // Could be due to:
    // - Missing identity
    // - Missing secret
    // - Secret mismatch.
    return { success: false, code: 'FAILURE' };
  }

  // Now that we know the identity and token are valid, we can always return 'helpful' errors and stop worrying about protecting identities.
  const { item } = result;
  const fieldKeys = { issuedAt: `${tokenType}IssuedAt`, redeemedAt: `${tokenType}RedeemedAt` };

  // Check that the token has not been redeemed already
  if (item[fieldKeys.redeemedAt]) {
    return { success: false, code: 'TOKEN_REDEEMED' };
  }

  // Check that the token has not expired
  if (!item[fieldKeys.issuedAt] || typeof item[fieldKeys.issuedAt].getTime !== 'function') {
    throw new Error(
      `Error redeeming authToken: field ${listKey}.${fieldKeys.issuedAt} isn't a valid Date object.`
    );
  }
  const elapsedMins = (Date.now() - item[fieldKeys.issuedAt].getTime()) / (1000 * 60);
  const validForMins = sanitiseValidForMinsConfig(tokenValidMins);
  if (elapsedMins > validForMins) {
    return { success: false, code: 'TOKEN_EXPIRED' };
  }

  // Authenticated!
  return { success: true, item };
}
