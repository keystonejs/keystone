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
    module: getContextModule(),
    export: 'KeystoneContext',
  },
});

// After dependencies are installed, but before Keystone's types are generated,
// resolving the path to the types will fail, so we fall back to the default
// (generic) context type path. When the dev process is started, the correct
// path will be used.
function getContextModule() {
  let contextModule;
  try {
    contextModule = require.resolve('.keystone/types');
  } catch (e) {
    contextModule = '@keystone-next/keystone/types';
  }
  return contextModule;
}

export const extendGraphqlSchema = (keystoneSchema: GraphQLSchema) =>
  mergeSchemas({ schemas: [keystoneSchema, nexusSchema] });
