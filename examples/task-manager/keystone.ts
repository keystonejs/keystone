import { config } from '@keystone-6/core';
import { lists } from './schema';
import { insertSeedData } from './seed-data';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
    async onConnect(context) {
      if (process.argv.includes('--seed-data')) {
        await insertSeedData(context);
      }
    },
  },
  lists,
});
