import type { IncomingMessage } from 'http';
import { graphql, GraphQLSchema, print } from 'graphql';
import type {
  SessionContext,
  KeystoneContext,
  KeystoneGraphQLAPI,
  BaseKeystone,
  ImagesConfig,
} from '@keystone-next/types';

import { getDbAPIFactory, itemAPIForList } from './itemAPI';
import { accessControlContext, skipAccessControlContext } from './createAccessControlContext';
import { createImagesContext } from './createImagesContext';

export function makeCreateContext({
  graphQLSchema,
  internalSchema,
  keystone,
  imagesConfig,
}: {
  graphQLSchema: GraphQLSchema;
  internalSchema: GraphQLSchema;
  keystone: BaseKeystone;
  imagesConfig?: ImagesConfig;
}) {
  const images = createImagesContext(imagesConfig);
  // We precompute these helpers here rather than every time createContext is called
  // because they involve creating a new GraphQLSchema, creating a GraphQL document AST(programmatically, not by parsing) and validating the
  // note this isn't as big of an optimisation as you would imagine(at least in comparison with the rest of the system),
  // the regular non-db lists api does more expensive things on every call
  // like parsing the generated GraphQL document, and validating it against the schema on _every_ call
  // is that really that bad? no not really. this has just been more optimised because the cost of what it's
  // doing is more obvious(even though in reality it's much smaller than the alternative)
  const publicDbApiFactories: Record<string, ReturnType<typeof getDbAPIFactory>> = {};
  for (const [listKey, list] of Object.entries(keystone.lists)) {
    publicDbApiFactories[listKey] = getDbAPIFactory(list.gqlNames, graphQLSchema);
  }

  const internalDbApiFactories: Record<string, ReturnType<typeof getDbAPIFactory>> = {};
  for (const [listKey, list] of Object.entries(keystone.lists)) {
    internalDbApiFactories[listKey] = getDbAPIFactory(list.gqlNames, internalSchema);
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
    const dbAPI: KeystoneContext['db']['lists'] = {};
    const itemAPI: KeystoneContext['lists'] = {};
    const contextToReturn: KeystoneContext = {
      schemaName,
      ...(skipAccessControl ? skipAccessControlContext : accessControlContext),
      db: { lists: dbAPI },
      lists: itemAPI,
      totalResults: 0,
      keystone,
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
    const dbAPIFactories = schemaName === 'public' ? publicDbApiFactories : internalDbApiFactories;
    for (const listKey of Object.keys(keystone.lists)) {
      dbAPI[listKey] = dbAPIFactories[listKey](contextToReturn);
      itemAPI[listKey] = itemAPIForList(listKey, contextToReturn, dbAPI[listKey]);
    }
    return contextToReturn;
  };

  return createContext;
}
