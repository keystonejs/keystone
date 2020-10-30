import type { KeystoneConfig } from '@keystone-next/types';
import { createKeystone } from '../classes/Keystone';
import { requireProjectFile } from './requireSource';

export const initKeystoneFromConfig = () => {
  const config: KeystoneConfig = requireProjectFile('keystone').default;

  return createKeystone(config);
};
