import { config } from '@keystone-6/core';
import { mergeSchemas } from '@graphql-tools/schema';
import { fixPrismaPath } from '../example-utils';
import { lists } from './schema';
import { nexusSchema } from './nexus';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixPrismaPath,
  },
  lists,
  extendGraphqlSchema: keystoneSchema => mergeSchemas({ schemas: [keystoneSchema, nexusSchema] }),
});
