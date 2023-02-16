import { config } from '@keystone-6/core';
import { fixPrismaPath } from '../../sandbox/utils';
import { lists } from './schema';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./test.db',

    // WARNING: this is only needed for examples, dont do this
    ...fixPrismaPath,
  },
  lists,
});
