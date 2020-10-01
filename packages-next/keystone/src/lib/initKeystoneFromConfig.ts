import type { KeystoneConfig } from '@keystone-spike/types';
import { createKeystone } from '../classes/Keystone';
import { requireProjectFile } from './requireSource';

export const initKeystoneFromConfig = (configFile = 'keystone.ts') => {
  const config: KeystoneConfig = requireProjectFile(configFile).default;

  return createKeystone(config);
};
