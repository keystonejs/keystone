import { createKeystone } from '../../lib/createKeystone';
import { initConfig } from '../../lib/initConfig';
import { requireSource } from '../../lib/requireSource';
import { CONFIG_PATH } from '../utils';
import type { StaticPaths } from '..';

export const deploy = async ({ dotKeystonePath }: StaticPaths) => {
  const config = initConfig(requireSource(CONFIG_PATH).default);

  if (config.db.adapter !== 'prisma_postgresql' && config.db.adapter !== 'prisma_sqlite') {
    console.log('keystone-next deploy only supports Prisma');
    process.exit(1);
  }

  if (!config.db.useMigrations) {
    console.log('db.useMigrations must be set to true in your config to use keystone-next deploy');
    process.exit(1);
  }

  const keystone = createKeystone(config, dotKeystonePath, 'none');

  console.log('✨ Deploying migrations');
  await keystone.adapter.deploy(keystone._consolidateRelationships());
  console.log('✅ Deployed migrations');
};
