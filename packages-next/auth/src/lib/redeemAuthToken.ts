import { AuthTokenRedemptionErrorCode } from '../types';
import { validateAuthToken } from './validateAuthToken';

export async function redeemAuthToken(
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
  // Palm off the bulk of the work; validating the identity and token
  const validationResult = await validateAuthToken(
    tokenType,
    list,
    listKey,
    identityField,
    protectIdentities,
    tokenValidMins,
    args,
    context
  );
  if (!validationResult.success) {
    return validationResult;
  }

  // Save the token and related info back to the item
  await context.lists[listKey].updateOne({
    id: validationResult.item.id,
    data: { [`${tokenType}RedeemedAt`]: new Date().toISOString() },
  });

  // Authenticated!
  return { success: true, item: validationResult.item };
}
