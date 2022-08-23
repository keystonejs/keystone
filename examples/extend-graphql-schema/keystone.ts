import { config } from '@keystone-6/core';
import { models } from './schema';
import { extendGraphqlSchema } from './custom-schema';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
  },
  models,
  extendGraphqlSchema,
});
