import type { IncomingMessage } from 'http';
import { execute, GraphQLSchema, parse } from 'graphql';
import type {
  SessionContext,
  KeystoneContext,
  KeystoneGraphQLAPI,
  BaseKeystone,
} from '@keystone-next/types';

import { itemAPIForList, getArgsFactory } from './itemAPI';
import { accessControlContext, skipAccessControlContext } from './createAccessControlContext';

export function makeCreateContext({
  graphQLSchema,
  keystone,
}: {
  graphQLSchema: GraphQLSchema;
  keystone: BaseKeystone;
}) {
  // We precompute these helpers here rather than every time createContext is called
  // because they require parsing the entire schema, which is potentially expensive.
  const getArgsByList: Record<string, ReturnType<typeof getArgsFactory>> = {};
  for (const [listKey, list] of Object.entries(keystone.lists)) {
    getArgsByList[listKey] = getArgsFactory(list, graphQLSchema);
  }

  const createContext = ({
    sessionContext,
    skipAccessControl = false,
    req,
  }: {
    sessionContext?: SessionContext<any>;
    skipAccessControl?: boolean;
    req?: IncomingMessage;
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
    const _req = req;
    const contextToReturn: KeystoneContext = {
      schemaName: 'public',
      ...(skipAccessControl ? skipAccessControlContext : accessControlContext),
      lists: itemAPI,
      totalResults: 0,
      keystone,
      // Only one of these will be available on any given context
      // TODO: Capture that in the type
      knex: keystone.adapter.knex,
      mongoose: keystone.adapter.mongoose,
      prisma: keystone.adapter.prisma,
      graphql: {
        createContext,
        raw: rawGraphQL,
        run: runGraphQL,
        schema: graphQLSchema,
      } as KeystoneGraphQLAPI<any>,
      maxTotalResults: keystone.queryLimits.maxTotalResults,
      createContext: ({
        sessionContext = _sessionContext,
        skipAccessControl = _skipAccessControl,
        req = _req,
      } = {}) => createContext({ sessionContext, skipAccessControl, req }),
      req,
      ...sessionContext,
      // Note: These two fields let us use the server-side-graphql-client library.
      // We may want to remove them once the updated itemAPI w/ resolveFields is available.
      executeGraphQL: rawGraphQL,
      gqlNames: (listKey: string) => keystone.lists[listKey].gqlNames,
    };
    for (const [listKey, list] of Object.entries(keystone.lists)) {
      itemAPI[listKey] = itemAPIForList(list, contextToReturn, getArgsByList[listKey]);
    }
    return contextToReturn;
  };

  return createContext;
}
