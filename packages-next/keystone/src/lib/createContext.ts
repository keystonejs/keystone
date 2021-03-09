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
  internalSchema,
  keystone,
}: {
  graphQLSchema: GraphQLSchema;
  internalSchema: GraphQLSchema;
  keystone: BaseKeystone;
}) {
  // We precompute these helpers here rather than every time createContext is called
  // because they require parsing the entire schema, which is potentially expensive.
  const publicGetArgsByList: Record<string, ReturnType<typeof getArgsFactory>> = {};
  for (const [listKey, list] of Object.entries(keystone.lists)) {
    publicGetArgsByList[listKey] = getArgsFactory(list, graphQLSchema);
  }

  const internalGetArgsByList: Record<string, ReturnType<typeof getArgsFactory>> = {};
  for (const [listKey, list] of Object.entries(keystone.lists)) {
    internalGetArgsByList[listKey] = getArgsFactory(list, internalSchema);
  }

  const createContext = ({
    sessionContext,
    skipAccessControl = false,
    req,
    schemaName = 'public',
  }: {
    sessionContext?: SessionContext<any>;
    skipAccessControl?: boolean;
    req?: IncomingMessage;
    schemaName?: 'public' | 'internal';
  } = {}): KeystoneContext => {
    const schema = schemaName === 'public' ? graphQLSchema : internalSchema;

    const rawGraphQL: KeystoneGraphQLAPI<any>['raw'] = ({ query, variables }) => {
      if (typeof query === 'string') {
        query = parse(query);
      }
      return Promise.resolve(
        execute({
          schema,
          document: query,
          contextValue: contextToReturn,
          variableValues: variables,
        })
      );
    };
    const runGraphQL: KeystoneGraphQLAPI<any>['run'] = async ({ query, variables }) => {
      let result = await rawGraphQL({ query, variables });
      if (result.errors?.length) {
        throw result.errors[0];
      }
      return result.data as Record<string, any>;
    };
    const itemAPI: Record<string, ReturnType<typeof itemAPIForList>> = {};
    const contextToReturn: KeystoneContext = {
      schemaName,
      ...(skipAccessControl ? skipAccessControlContext : accessControlContext),
      lists: itemAPI,
      totalResults: 0,
      keystone,
      // Only one of these will be available on any given context
      // TODO: Capture that in the type
      knex: keystone.adapter.knex,
      mongoose: keystone.adapter.mongoose,
      prisma: keystone.adapter.prisma,
      graphql: { raw: rawGraphQL, run: runGraphQL, schema },
      maxTotalResults: keystone.queryLimits.maxTotalResults,
      sudo: () =>
        createContext({ sessionContext, skipAccessControl: true, req, schemaName: 'internal' }),
      exitSudo: () => createContext({ sessionContext, skipAccessControl: false, req }),
      withSession: session =>
        createContext({
          sessionContext: { ...sessionContext, session } as SessionContext<any>,
          skipAccessControl,
          req,
        }),
      req,
      ...sessionContext,
      // Note: These two fields let us use the server-side-graphql-client library.
      // We may want to remove them once the updated itemAPI w/ resolveFields is available.
      executeGraphQL: rawGraphQL,
      gqlNames: (listKey: string) => keystone.lists[listKey].gqlNames,
    };
    const getArgsByList = schemaName === 'public' ? publicGetArgsByList : internalGetArgsByList;
    for (const [listKey, list] of Object.entries(keystone.lists)) {
      itemAPI[listKey] = itemAPIForList(list, contextToReturn, getArgsByList[listKey]);
    }
    return contextToReturn;
  };

  return createContext;
}
