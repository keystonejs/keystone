import { execute, GraphQLSchema, parse } from 'graphql';
import type {
  SessionContext,
  KeystoneContext,
  KeystoneGraphQLAPI,
  BaseKeystone,
} from '@keystone-next/types';

import { itemAPIForList } from './itemAPI';
import { accessControlContext, skipAccessControlContext } from './createAccessControlContext';

export function makeCreateContext({
  graphQLSchema,
  keystone,
}: {
  graphQLSchema: GraphQLSchema;
  keystone: BaseKeystone;
}) {
  const createContext = ({
    sessionContext,
    skipAccessControl = false,
  }: {
    sessionContext?: SessionContext;
    skipAccessControl?: boolean;
  } = {}): KeystoneContext => {
    const rawGraphQL: KeystoneGraphQLAPI<any>['raw'] = ({ query, context, variables }) => {
      if (typeof query === 'string') {
        query = parse(query);
      }
      return Promise.resolve(
        execute({
          schema: graphQLSchema,
          document: query,
          contextValue: context ?? contextToReturn,
          variableValues: variables,
        })
      );
    };
    const runGraphQL: KeystoneGraphQLAPI<any>['run'] = async args => {
      let result = await rawGraphQL(args);
      if (result.errors?.length) {
        throw result.errors[0];
      }
      return result.data as Record<string, any>;
    };
    const itemAPI: Record<string, ReturnType<typeof itemAPIForList>> = {};
    const _sessionContext = sessionContext;
    const _skipAccessControl = skipAccessControl;
    const contextToReturn: KeystoneContext = {
      schemaName: 'public',
      ...(skipAccessControl ? skipAccessControlContext : accessControlContext),
      lists: itemAPI,
      totalResults: 0,
      keystone,
      // Only one of these will be available on any given context
      // TODO: Capture that in the type
      knex: keystone.adapters.KnexAdapter?.knex,
      mongoose: keystone.adapters.MongooseAdapter?.mongoose,
      prisma: keystone.adapters.PrismaAdapter?.prisma,
      graphql: {
        createContext,
        raw: rawGraphQL,
        run: runGraphQL,
        schema: graphQLSchema,
      } as KeystoneGraphQLAPI<any>,
      maxTotalResults: (keystone as any).queryLimits.maxTotalResults,
      createContext: ({
        sessionContext = _sessionContext,
        skipAccessControl = _skipAccessControl,
      } = {}) => createContext({ sessionContext, skipAccessControl }),
      ...sessionContext,
      // Note: These two fields let us use the server-side-graphql-client library.
      // We may want to remove them once the updated itemAPI w/ resolveFields is available.
      executeGraphQL: rawGraphQL,
      gqlNames: (listKey: string) => keystone.lists[listKey].gqlNames,
    };
    for (const [listKey, list] of Object.entries(keystone.lists)) {
      itemAPI[listKey] = itemAPIForList(list, contextToReturn, graphQLSchema);
    }
    return contextToReturn;
  };

  return createContext;
}
