import type { KeystoneConfig } from '@keystone-next/types';
import { createKeystone } from './createKeystone';
import { requireProjectFile } from './requireSource';

export const initKeystoneFromConfig = () => {
  const config: KeystoneConfig = requireProjectFile('keystone').default;

  return createKeystone(config);
};
