import { config } from '@keystone-6/core';
import { lists } from './src/keystone/schema';
import { seedDemoData } from './src/keystone/seed';
import type { Context } from '.keystone/types';

export default config({
  db: {
    provider: 'sqlite',
    url: `file:${process.cwd()}/keystone.db`, // next.js requires an absolute path for sqlite
    onConnect: async (context: Context) => {
      await seedDemoData(context);
    },

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/.myprisma/client',
  },
  lists,
});
