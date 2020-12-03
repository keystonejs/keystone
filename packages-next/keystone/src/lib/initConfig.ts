import { KeystoneConfig } from '@keystone-next/types';

import { applyIdFieldDefaults } from '../lib/applyIdFieldDefaults';

/*
  This function executes the validation and other initialisation logic that
  needs to be run on Keystone Config before it can be used.
*/

export function initConfig(config: KeystoneConfig) {
  config.lists = applyIdFieldDefaults(config);
  return config;
}
