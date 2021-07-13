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
    // todo: throw on errors other than access control
    console.log(err);
    return { success: false, code: 'IDENTITY_NOT_FOUND' };
  }
}
