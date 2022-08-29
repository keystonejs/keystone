import { config } from '@keystone-6/core';
import { mergeSchemas } from '@graphql-tools/schema';
import { models } from './schema';
import { nexusSchema } from './nexus';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
  },
  models,
  extendGraphqlSchema: keystoneSchema => mergeSchemas({ schemas: [keystoneSchema, nexusSchema] }),
});
