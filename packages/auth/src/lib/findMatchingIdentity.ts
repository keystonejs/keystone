import type { KeystoneDbAPI } from '@keystone-next/keystone/types';

import { AuthTokenRequestErrorCode } from '../types';

export async function findMatchingIdentity(
  identityField: string,
  identity: string,
  dbItemAPI: KeystoneDbAPI<any>[string]
): Promise<
  | { success: false; code: AuthTokenRequestErrorCode }
  | { success: true; item: { id: any; [prop: string]: any } }
> {
  const item = await dbItemAPI.findOne({ where: { [identityField]: identity } });
  if (item) {
    return { success: true, item };
  } else {
    return { success: false, code: 'IDENTITY_NOT_FOUND' };
  }
}
