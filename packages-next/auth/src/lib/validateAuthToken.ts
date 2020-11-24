import { AuthTokenRedemptionErrorCode } from '../types';

// The tokensValidForMins config is from userland so could be anything; make it sane
function sanitiseValidForMinsConfig(input: any): number {
  const parsed = Number.parseFloat(input);
  // > 10 seconds, < 24 hrs, default 10 mins
  return parsed ? Math.max(1 / 6, Math.min(parsed, 60 * 24)) : 10;
}

export async function validateAuthToken(
  tokenType: 'passwordReset' | 'magicAuth',
  list: any,
  listKey: string,
  identityField: string,
  protectIdentities: boolean,
  tokenValidMins: number | undefined,
  args: Record<string, string>,
  context: any
): Promise<
  | { success: false; code: AuthTokenRedemptionErrorCode }
  | { success: true; item: { id: any; [prop: string]: any } }
> {
  const fieldKeys = {
    token: `${tokenType}Token`,
    issuedAt: `${tokenType}IssuedAt`,
    redeemedAt: `${tokenType}RedeemedAt`,
  };
  const tokenFieldInstance = list.fieldsByPath[fieldKeys.token];
  const identity = args[identityField];
  const canidatePlaintext = args.token;

  // TODO: Allow additional filters to be suppled in config? eg. `validUserConditions: { isEnable: true, isVerified: true, ... }`
  const items = await context.lists[listKey].findMany({ where: { [identityField]: identity } });

  // Check the for identity-related failures first
  let specificCode: AuthTokenRedemptionErrorCode | undefined;
  if (items.length === 0) {
    specificCode = 'IDENTITY_NOT_FOUND';
  } else if (items.length === 1 && !items[0][fieldKeys.token]) {
    specificCode = 'TOKEN_NOT_SET';
  } else if (items.length > 1) {
    specificCode = 'MULTIPLE_IDENTITY_MATCHES';
  }
  if (typeof specificCode !== 'undefined') {
    // See "Identity Protection" in the README as to why this is a thing
    if (protectIdentities) {
      await tokenFieldInstance.generateHash('simulated-password-to-counter-timing-attack');
    }
    return { success: false, code: protectIdentities ? 'FAILURE' : specificCode };
  }

  // Check for non-identity failures
  const item = items[0];
  if (await tokenFieldInstance.compare(canidatePlaintext, item[fieldKeys.token])) {
    // Now that we know the identity and token are valid, we can always return 'helpful' errors and stop worrying about protectIdentities
    if (item[fieldKeys.redeemedAt]) {
      return { success: false, code: 'TOKEN_REDEEMED' };
    }
    if (!item[fieldKeys.issuedAt] || typeof item[fieldKeys.issuedAt].getTime !== 'function') {
      throw new Error(
        `Error redeeming authToken: field ${list.listKey}.${fieldKeys.issuedAt} isn't a valid Date object.`
      );
    }
    const elapsedMins = (Date.now() - item[fieldKeys.issuedAt].getTime()) / (1000 * 60);
    const validForMins = sanitiseValidForMinsConfig(tokenValidMins);
    if (elapsedMins > validForMins) {
      return { success: false, code: 'TOKEN_EXPIRED' };
    }

    // Authenticated!
    return { success: true, item };
  } else {
    return { success: false, code: protectIdentities ? 'FAILURE' : 'TOKEN_MISMATCH' };
  }
}
