import { AuthErrorCode } from '../types';

// The tokensValidForMins config is from userland so could be anything; make it sane
function sanitiseValidForMinsConfig(input: any): number {
  const parsed = Number.parseFloat(input);
  // > 10 seconds, < 24 hrs, default 10 mins
  return parsed ? Math.max(1 / 6, Math.min(parsed, 60 * 24)) : 10;
}

export async function validateAuthToken(
  tokenType: 'passwordReset' | 'magicAuth',
  list: any,
  identityField: string,
  protectIdentities: boolean,
  tokenValidMins: number | undefined,
  args: Record<string, string>
): Promise<
  | {
      success: false;
      code: AuthErrorCode;
    }
  | {
      success: true;
      item: { id: any; [prop: string]: any };
    }
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
  // TODO: Maybe talk to the list rather than the adapter? (Might not validate the filters though)
  const items = await list.adapter.find({ [identityField]: identity });

  // Check the for identity-related failures first
  let specificCode: AuthErrorCode | undefined;
  if (items.length === 0) {
    specificCode = 'AUTH_TOKEN_REDEMPTION_IDENTITY_NOT_FOUND';
  } else if (items.length === 1 && !items[0][fieldKeys.token]) {
    specificCode = 'AUTH_TOKEN_REDEMPTION_TOKEN_NOT_SET';
  } else if (items.length > 1) {
    specificCode = 'AUTH_TOKEN_REDEMPTION_MULTIPLE_IDENTITY_MATCHES';
  }
  if (typeof specificCode !== 'undefined') {
    // See "Identity Protection" in the README as to why this is a thing
    if (protectIdentities) {
      await tokenFieldInstance.generateHash('simulated-password-to-counter-timing-attack');
    }
    return {
      success: false,
      code: protectIdentities ? 'AUTH_TOKEN_REDEMPTION_FAILURE' : specificCode,
    };
  }

  // Check for non-identity failures
  const item = items[0];
  const isMatch = await tokenFieldInstance.compare(canidatePlaintext, item[fieldKeys.token]);
  if (!isMatch) {
    return {
      success: false,
      code: protectIdentities
        ? 'AUTH_TOKEN_REDEMPTION_FAILURE'
        : 'AUTH_TOKEN_REDEMPTION_TOKEN_MISMATCH',
    };
  }

  // Now that we know the identity and token are valid, we can always return 'helpful' errors and stop worrying about protectIdentities
  if (item[fieldKeys.redeemedAt]) {
    return { success: false, code: 'AUTH_TOKEN_REDEMPTION_TOKEN_REDEEMED' };
  }
  if (!item[fieldKeys.issuedAt] || typeof item[fieldKeys.issuedAt].getTime !== 'function') {
    console.error(
      new Error(
        `Error redeeming authToken: field ${JSON.stringify(list.listKey)}.${JSON.stringify(
          fieldKeys.issuedAt
        )} isn't a valid Date object.`
      )
    );
    return { success: false, code: 'INTERNAL_ERROR' };
  }
  const elapsedMins = (Date.now() - item[fieldKeys.issuedAt].getTime()) / (1000 * 60);
  const validForMins = sanitiseValidForMinsConfig(tokenValidMins);
  if (elapsedMins > validForMins) {
    return { success: false, code: 'AUTH_TOKEN_REDEMPTION_TOKEN_EXPIRED' };
  }

  // Authenticated!
  return { success: true, item };
}
