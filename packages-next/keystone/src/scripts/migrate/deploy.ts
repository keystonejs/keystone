import { createKeystone } from '../../lib/createKeystone';
import { initConfig } from '../../lib/initConfig';
import { requireSource } from '../../lib/requireSource';
import { CONFIG_PATH } from '../utils';
import type { StaticPaths } from '..';

export const deploy = async ({ dotKeystonePath }: StaticPaths) => {
  console.log('🤞 Migrating Keystone');

  const config = initConfig(requireSource(CONFIG_PATH).default);
  const keystone = createKeystone(config, dotKeystonePath, 'deploy');

  console.log('✨ Deploying migrations');
  await keystone.adapter.deploy(keystone._consolidateRelationships());
};
