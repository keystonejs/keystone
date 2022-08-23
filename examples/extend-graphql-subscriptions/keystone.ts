import { config } from '@keystone-6/core';
import { models, extendGraphqlSchema } from './schema';
import { extendHttpServer } from './websocket';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
  },
  models,
  server: {
    extendHttpServer,
  },
  extendGraphqlSchema,
});
