import { AuthTokenRedemptionErrorCode } from '../types';
import { validateAuthToken } from './validateAuthToken';

export async function redeemAuthToken(
  tokenType: 'passwordReset' | 'magicAuth',
  list: any,
  identityField: string,
  protectIdentities: boolean,
  tokenValidMins: number | undefined,
  args: Record<string, string>,
  itemAPI: any
): Promise<
  | { success: false; code: AuthTokenRedemptionErrorCode }
  | { success: true; item: { id: any; [prop: string]: any } }
> {
  // Palm off the bulk of the work; validating the identity and token
  const validationResult = await validateAuthToken(
    tokenType,
    list,
    identityField,
    protectIdentities,
    tokenValidMins,
    args,
    itemAPI
  );
  if (!validationResult.success) {
    return validationResult;
  }

  // Save the token and related info back to the item
  await itemAPI.updateOne({
    id: validationResult.item.id,
    data: { [`${tokenType}RedeemedAt`]: new Date().toISOString() },
  });

  // Authenticated!
  return { success: true, item: validationResult.item };
}
