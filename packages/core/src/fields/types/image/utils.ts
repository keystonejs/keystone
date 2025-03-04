import type { Readable } from 'node:stream'
import type { BaseKeystoneTypeInfo, KeystoneContext, MaybePromise } from '../../../types'

export const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'png', 'webp', 'gif'] as const

export type StorageAdapter<TypeInfo extends BaseKeystoneTypeInfo> = {
  put(key: string, stream: Readable, meta: { contentType: string }): Promise<void>
  delete(key: string): Promise<void>
  url(key: string, context: KeystoneContext<TypeInfo>): MaybePromise<string>
}
