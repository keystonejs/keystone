import { PasswordAuthErrorCode } from '../types';

export async function validateSecret(
  list: any,
  identityField: string,
  secretField: string,
  protectIdentities: boolean,
  args: Record<string, string>,
  itemAPI: any
): Promise<
  | { success: false; code: PasswordAuthErrorCode }
  | { success: true; item: { id: any; [prop: string]: any } }
> {
  const identity = args[identityField];
  const canidatePlaintext = args[secretField];
  const secretFieldInstance = list.fieldsByPath[secretField];

  // TODO: Allow additional filters to be suppled in config? eg. `validUserConditions: { isEnable: true, isVerified: true, ... }`
  const items = await itemAPI.findMany({ where: { [identityField]: identity } });

  // Identity failures with helpful errors
  let specificCode: PasswordAuthErrorCode | undefined;
  if (items.length === 0) {
    specificCode = 'IDENTITY_NOT_FOUND';
  } else if (items.length === 1 && !items[0][secretField]) {
    specificCode = 'SECRET_NOT_SET';
  } else if (items.length > 1) {
    specificCode = 'MULTIPLE_IDENTITY_MATCHES';
  }
  if (typeof specificCode !== 'undefined') {
    // See "Identity Protection" in the README as to why this is a thing
    if (protectIdentities) {
      await secretFieldInstance.generateHash('simulated-password-to-counter-timing-attack');
    }
    return { success: false, code: protectIdentities ? 'FAILURE' : specificCode };
  }

  const item = items[0];
  if (await secretFieldInstance.compare(canidatePlaintext, item[secretField])) {
    // Authenticated!
    return { success: true, item };
  } else {
    return { success: false, code: protectIdentities ? 'FAILURE' : 'SECRET_MISMATCH' };
  }
}
