import type { BaseKeystoneTypeInfo, KeystoneConfig, KeystoneContext } from './types';
import { initConfig } from './lib/config';
import { createSystem } from './lib/createSystem';

export function getContext<TypeInfo extends BaseKeystoneTypeInfo>(
  config: KeystoneConfig<TypeInfo>,
  PrismaModule: unknown
): KeystoneContext<TypeInfo> {
  const system = createSystem(initConfig(config));
  const { context } = system.getKeystone(PrismaModule as any);
  return context;
}
