import { KeystoneConfig } from '../../types';

import { applyIdFieldDefaults } from './applyIdFieldDefaults';

/*
  This function executes the validation and other initialisation logic that
  needs to be run on Keystone Config before it can be used.
*/

export function initConfig(config: KeystoneConfig) {
  if (!['postgresql', 'sqlite', 'mysql'].includes(config.db.provider)) {
    throw new Error(
      'Invalid db configuration. Please specify db.provider as either "sqlite", "postgresql" or "mysql"'
    );
  }

  return { ...config, models: applyIdFieldDefaults(config) };
}
