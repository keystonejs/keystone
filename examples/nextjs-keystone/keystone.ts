import { config } from '@keystone-6/core';
import { fixPrismaPath } from './../example-utils';
import { lists } from './src/keystone/schema';
import { withAuth, session } from './src/keystone/auth';
import { seedDemoData } from './src/keystone/seed';
import type { Context } from '.keystone/types';

// Next.js deploys need absolute path to sqlite db file
const dbFilePath = `${process.cwd()}/keystone.db`;
export default withAuth(
  config({
    db: {
      provider: 'sqlite',
      url: `file:${dbFilePath}`,
      onConnect: async (context: Context) => {
        await seedDemoData(context);
      },

      // WARNING: this is only needed for our monorepo examples, dont do this
      ...fixPrismaPath,
    },
    lists,
    session,
  })
);
