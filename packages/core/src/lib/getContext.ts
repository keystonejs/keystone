import { BaseKeystoneTypeInfo, KeystoneConfig, KeystoneContext } from '../types';
import { initConfig } from './config/initConfig';
import { createSystem } from './createSystem';

export function getContext<TypeInfo extends BaseKeystoneTypeInfo>(
  config: KeystoneConfig<TypeInfo>,
  PrismaModule: unknown
): KeystoneContext<TypeInfo> {
  const system = createSystem(initConfig(config));
  const { createContext } = system.getKeystone(PrismaModule as any);
  return createContext();
}
