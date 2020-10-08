import { AuthErrorCode } from '../types';
import { validateAuthToken } from './validateAuthToken';

export async function redeemAuthToken(
  tokenType: 'passwordReset' | 'magicAuth',
  list: any,
  identityField: string,
  protectIdentities: boolean,
  tokenValidMins: number | undefined,
  args: Record<string, string>,
  ctx: any
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

  // Palm off the bulk of the work; validating the identity and token
  const validationResult = await validateAuthToken(
    tokenType,
    list,
    identityField,
    protectIdentities,
    tokenValidMins,
    args
  );
  if (!validationResult.success) {
    return validationResult;
  }

  // Save the token and related info back to the item
  const { errors } = await ctx.keystone.executeGraphQL({
    context: ctx.keystone.createContext({ skipAccessControl: true }),
    query: `mutation($id: String, $token: String, $now: String) {
      ${list.gqlNames.updateMutationName}(id: $id, data: { ${fieldKeys.redeemedAt}: $now }) { id }
    }`,
    variables: { id: validationResult.item.id, now: new Date().toISOString() },
  });
  if (Array.isArray(errors) && errors.length > 0) {
    console.error(errors[0] && (errors[0].stack || errors[0].message));
    return { success: false, code: 'INTERNAL_ERROR' };
  }

  // Authenticated!
  return { success: true, item: validationResult.item };
}
