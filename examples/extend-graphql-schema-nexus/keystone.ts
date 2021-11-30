import { config } from '@keystone-6/core';
import { mergeSchemas } from '@graphql-tools/schema';
import { lists } from './schema';
import { nexusSchema } from './nexus';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
  },
  lists,
  extendGraphqlSchema: keystoneSchema => mergeSchemas({ schemas: [keystoneSchema, nexusSchema] }),
});
