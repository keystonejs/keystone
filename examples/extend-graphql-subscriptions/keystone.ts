import { config } from '@keystone-6/core';
import { lists, extendGraphqlSchema } from './schema';
import { extendHttpServer } from './websocket';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
  },
  lists,
  server: {
    extendHttpServer,
  },
  extendGraphqlSchema,
});
