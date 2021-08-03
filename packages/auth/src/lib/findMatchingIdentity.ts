import type { KeystoneDbAPI } from '@keystone-next/types';

import { AuthTokenRequestErrorCode } from '../types';

export async function findMatchingIdentity(
  identityField: string,
  identity: string,
  dbItemAPI: KeystoneDbAPI<any>[string]
): Promise<
  | { success: false; code: AuthTokenRequestErrorCode }
  | { success: true; item: { id: any; [prop: string]: any } }
> {
  try {
    const item = await dbItemAPI.findOne({ where: { [identityField]: identity } });
    return { success: true, item };
  } catch (err) {
    if (err.message === 'You do not have access to this resource') {
      return { success: false, code: 'IDENTITY_NOT_FOUND' };
    }
    throw err;
  }
}
