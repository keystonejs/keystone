import type { IncomingMessage } from 'http';
import { graphql, GraphQLSchema, print } from 'graphql';
import type {
  SessionContext,
  KeystoneContext,
  KeystoneGraphQLAPI,
  BaseKeystone,
  ImagesConfig,
} from '@keystone-next/types';

import { itemDbAPIForList, itemAPIForList, getArgsFactory } from './itemAPI';
import { createImagesContext } from './createImagesContext';

export function makeCreateContext({
  graphQLSchema,
  internalSchema,
  imagesConfig,
}: {
  graphQLSchema: GraphQLSchema;
  internalSchema: GraphQLSchema;
  imagesConfig?: ImagesConfig;
}) {
  const images = createImagesContext(imagesConfig);
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
      const source = typeof query === 'string' ? query : print(query);
      return Promise.resolve(
        graphql({ schema, source, contextValue: contextToReturn, variableValues: variables })
      );
    };
    const runGraphQL: KeystoneGraphQLAPI<any>['run'] = async ({ query, variables }) => {
      let result = await rawGraphQL({ query, variables });
      if (result.errors?.length) {
        throw result.errors[0];
      }
      return result.data as Record<string, any>;
    };
    const dbAPI: Record<string, ReturnType<typeof itemDbAPIForList>> = {};
    const itemAPI: Record<string, ReturnType<typeof itemAPIForList>> = {};
    const contextToReturn: KeystoneContext = {
      schemaName,
      db: { lists: dbAPI },
      lists: itemAPI,
      totalResults: 0,
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
      // Note: This field lets us use the server-side-graphql-client library.
      // We may want to remove it once the updated itemAPI w/ query is available.
      gqlNames: (listKey: string) => keystone.lists[listKey].gqlNames,
      images,
    };
    const getArgsByList = schemaName === 'public' ? publicGetArgsByList : internalGetArgsByList;
    for (const [listKey, list] of Object.entries(keystone.lists)) {
      dbAPI[listKey] = itemDbAPIForList(list, contextToReturn, getArgsByList[listKey]);
      itemAPI[listKey] = itemAPIForList(list, contextToReturn, getArgsByList[listKey]);
    }
    return contextToReturn;
  };

  return createContext;
}
