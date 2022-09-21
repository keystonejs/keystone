import { config } from '@keystone-6/core';
import { lists, extendGraphqlSchema } from './schema';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
  },
  lists,
  extendGraphqlSchema,
});
