import { createKeystone } from '../../lib/createKeystone';
import { initConfig } from '../../lib/initConfig';
import { requireSource } from '../../lib/requireSource';
import { CONFIG_PATH } from '../utils';
import type { StaticPaths } from '..';

export const reset = async ({ dotKeystonePath }: StaticPaths) => {
  console.log('🤞 Migrating Keystone');

  const config = initConfig(requireSource(CONFIG_PATH).default);
  const keystone = createKeystone(config, dotKeystonePath, 'reset');

  console.log('✨ Resetting database');
  await keystone.adapters.PrismaAdapter._prepareSchema(keystone._consolidateRelationships());
  await keystone.adapters.PrismaAdapter.dropDatabase();
};
