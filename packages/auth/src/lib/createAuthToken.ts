import { randomBytes } from 'crypto'
import type { KeystoneDbAPI } from '@keystone-6/core/types'

export async function createAuthToken (
  identityField: string,
  identity: string,
  dbItemAPI: KeystoneDbAPI<any>[string]
): Promise<
  { success: false } | { success: true, itemId: string | number | bigint, token: string }
> {
  // FIXME : identity lookups may leak information due to timing attacks
  const item = await dbItemAPI.findOne({ where: { [identityField]: identity } })
  if (!item) return { success: false }

  return {
    success: true,
    itemId: item.id,
    token: randomBytes(16).toString('base64url').slice(0, 20), // (128 / Math.log2(64)) < 20
  }
}
