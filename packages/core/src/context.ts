import {
  type BaseKeystoneTypeInfo,
  type ResolvedKeystoneConfig,
  type KeystoneContext
} from './types'
import { createSystem } from './lib/createSystem'

export function getContext<TypeInfo extends BaseKeystoneTypeInfo> (
  config: ResolvedKeystoneConfig<TypeInfo>,
  PrismaModule: unknown
): KeystoneContext<TypeInfo> {
  const system = createSystem(config)
  const { context } = system.getKeystone(PrismaModule)
  return context
}