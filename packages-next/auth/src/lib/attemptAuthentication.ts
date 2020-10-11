import { AuthErrorCode } from '../types';

export async function attemptAuthentication(
  list: any,
  identityField: string,
  secretField: string,
  protectIdentities: boolean,
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
  const identity = args[identityField];
  const canidatePlaintext = args[secretField];
  const secretFieldInstance = list.fieldsByPath[secretField];

  // TODO: Allow additional filters to be suppled in config? eg. `validUserConditions: { isEnable: true, isVerified: true, ... }`
  // TODO: Maybe talk to the list rather than the adapter? (might not validate the filters though)
  const items = await list.adapter.find({ [identityField]: identity });

  // Identity failures with helpful errors
  let specificCode: AuthErrorCode | undefined;
  if (items.length === 0) {
    specificCode = 'PASSWORD_AUTH_IDENTITY_NOT_FOUND';
  } else if (items.length === 1 && !items[0][secretField]) {
    specificCode = 'PASSWORD_AUTH_SECRET_NOT_SET';
  } else if (items.length > 1) {
    specificCode = 'PASSWORD_AUTH_MULTIPLE_IDENTITY_MATCHES';
  }
  if (typeof specificCode !== 'undefined') {
    // See "Identity Protection" in the README as to why this is a thing
    if (protectIdentities) {
      await secretFieldInstance.generateHash('simulated-password-to-counter-timing-attack');
    }
    return { success: false, code: protectIdentities ? 'PASSWORD_AUTH_FAILURE' : specificCode };
  }

  const item = items[0];
  const isMatch = await secretFieldInstance.compare(canidatePlaintext, item[secretField]);
  if (!isMatch) {
    return {
      success: false,
      code: protectIdentities ? 'PASSWORD_AUTH_FAILURE' : 'PASSWORD_AUTH_SECRET_MISMATCH',
    };
  }

  // Authenticated!
  return { success: true, item };
}
