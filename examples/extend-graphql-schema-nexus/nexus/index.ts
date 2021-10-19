import { join } from 'path';
import type { GraphQLSchema } from 'graphql';
import { makeSchema } from 'nexus';
import { mergeSchemas } from '@graphql-tools/schema';

import * as types from './types';

const nexusSchema = makeSchema({
  types,
  outputs: {
    typegen: join(__dirname, 'nexus-typegen.ts'),
  },
  // This binds the Keystone Context with correctly generated types for the
  // Keystone `db` and `query` args, as well as the prisma client
  contextType: {
    module: '.keystone/types',
    export: 'KeystoneContext',
  },
});

export const extendGraphqlSchema = (keystoneSchema: GraphQLSchema) =>
  mergeSchemas({ schemas: [keystoneSchema, nexusSchema] });
