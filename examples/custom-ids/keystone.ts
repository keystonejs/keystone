import { config } from '@keystone-6/core';
import { fixPrismaPath } from '../example-utils';
import { lists } from './schema';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
    // provider: 'postgresql',
    // url: `postgres://${process.env.USER}@localhost:5432/keystone-custom-id`,

    // WARNING: this is only needed for our monorepo examples, don't do this
    ...fixPrismaPath,
  },
  lists,
});
