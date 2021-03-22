import { createKeystone } from '../../lib/createKeystone';
import { initConfig } from '../../lib/initConfig';
import { requireSource } from '../../lib/requireSource';
import { CONFIG_PATH } from '../utils';
import type { StaticPaths } from '..';

export const reset = async ({ dotKeystonePath }: StaticPaths) => {
  const config = initConfig(requireSource(CONFIG_PATH).default);
  const keystone = createKeystone(config, dotKeystonePath, 'none');

  console.log('✨ Resetting database');
  await keystone.adapter._prepareSchema(keystone._consolidateRelationships());
  await keystone.adapter.dropDatabase();
  console.log('✅ Database reset');
};
