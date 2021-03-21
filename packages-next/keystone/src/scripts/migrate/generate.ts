import path from 'path';
import {
  CLIOptionsForCreateMigration,
  createMigration,
} from '@keystone-next/adapter-prisma-legacy';
import { createSystem } from '../../lib/createSystem';
import { initConfig } from '../../lib/initConfig';
import { requireSource } from '../../lib/requireSource';
import { CONFIG_PATH } from '../utils';
import type { StaticPaths } from '..';

export const generate = async (
  { dotKeystonePath }: StaticPaths,
  args: CLIOptionsForCreateMigration
) => {
  const config = initConfig(requireSource(CONFIG_PATH).default);
  if (config.db.adapter !== 'prisma_postgresql' && config.db.adapter !== 'prisma_sqlite') {
    console.log('keystone-next generate only supports Prisma');
    process.exit(1);
  }

  if (!config.db.useMigrations) {
    console.log(
      'db.useMigrations must be set to true in your config to use keystone-next generate'
    );
    process.exit(1);
  }

  const { keystone } = createSystem(config, dotKeystonePath, 'none');

  await keystone.adapter._generateClient(keystone._consolidateRelationships());
  await createMigration(
    config.db.url,
    keystone.adapter.prismaSchema,
    path.resolve(keystone.adapter.schemaPath),
    args
  );
};
