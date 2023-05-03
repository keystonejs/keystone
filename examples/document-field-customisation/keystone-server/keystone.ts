import { config } from '@keystone-6/core';
import type { KeystoneConfig } from '@keystone-6/core/types';
import { fixNextConfig, fixPrismaPath } from '../../example-utils';
import { seedDatabase } from './src/seed';
import { lists } from './src/schema';
import { Context, TypeInfo } from '.keystone/types';

const db: KeystoneConfig<TypeInfo>['db'] = {
  provider: 'sqlite',
  url: process.env.DATABASE_URL || 'file:./database.db',
  async onConnect(context: Context) {
    if (process.argv.includes('--seed-database')) {
      await seedDatabase(context);
    }
  },

  // WARNING: this is only needed for our monorepo examples, dont do this
  ...fixPrismaPath,
};

export default config({
  db,
  lists,
  ui: {
    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixNextConfig,
  },
});
