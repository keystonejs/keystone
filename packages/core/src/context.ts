import type { BaseKeystoneTypeInfo, KeystoneConfig, KeystoneContext } from './types';
import { initConfig } from './lib/config';
import { createSystem } from './lib/createSystem';

export function getContext<TypeInfo extends BaseKeystoneTypeInfo>(
  config: KeystoneConfig<TypeInfo>
): KeystoneContext<TypeInfo> {
  const system = createSystem(initConfig(config));
  const { context } = system.getKeystone();
  return context;
}
