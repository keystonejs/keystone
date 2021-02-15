import { execute, GraphQLSchema, parse } from 'graphql';
import type {
  SessionContext,
  CreateContext,
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

  // This context creation code is somewhat fiddly, because some parts of the
  // KeystoneContext object need to reference the object itself! In order to
  // make this happen, we first prepare the object (_prepareContext), putting in
  // placeholders for those parts which require self-binding. We then use this
  // object in _bindToContext to fill in the blanks.

  const _prepareContext = ({
    sessionContext,
    skipAccessControl,
    req,
  }: Parameters<CreateContext>[0]): KeystoneContext => ({
    schemaName: 'public',
    ...(skipAccessControl ? skipAccessControlContext : accessControlContext),
    totalResults: 0,
    keystone,
    // Only one of these will be available on any given context
    // TODO: Capture that in the type
    knex: keystone.adapter.knex,
    mongoose: keystone.adapter.mongoose,
    prisma: keystone.adapter.prisma,
    maxTotalResults: keystone.queryLimits.maxTotalResults,
    req,
    ...sessionContext,
    gqlNames: (listKey: string) => keystone.lists[listKey].gqlNames,

    // These properties need to refer to this object. We will bind them later (see _bindToContext)
    sudo: (() => {}) as KeystoneContext['sudo'],
    exitSudo: (() => {}) as KeystoneContext['exitSudo'],
    withSession: ((() => {}) as unknown) as KeystoneContext['withSession'],
    graphql: {} as KeystoneContext['graphql'],
    executeGraphQL: undefined as KeystoneContext['executeGraphQL'],
    lists: {} as KeystoneContext['lists'],
  });

  const _bindToContext = ({
    sessionContext,
    skipAccessControl,
    req,
    contextToReturn,
  }: Parameters<CreateContext>[0] & { contextToReturn: KeystoneContext }) => {
    // Bind sudo/leaveSudo/withSession
    contextToReturn.sudo = () => createContext({ sessionContext, skipAccessControl: true, req });
    contextToReturn.exitSudo = () =>
      createContext({ sessionContext, skipAccessControl: false, req });
    contextToReturn.withSession = (session: any) =>
      createContext({
        sessionContext: { ...sessionContext, session } as SessionContext<any>,
        skipAccessControl,
        req,
      });

    // Bind items API
    for (const [listKey, list] of Object.entries(keystone.lists)) {
      contextToReturn.lists[listKey] = itemAPIForList(
        list,
        contextToReturn,
        getArgsByList[listKey]
      );
    }

    // Bind graphql API
    const rawGraphQL: KeystoneGraphQLAPI<any>['raw'] = ({ query, context, variables }) => {
      if (typeof query === 'string') {
        query = parse(query);
      }
      return Promise.resolve(
        execute({
          schema: graphQLSchema,
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
    contextToReturn.graphql = {
      createContext,
      raw: rawGraphQL,
      run: runGraphQL,
      schema: graphQLSchema,
    };
    contextToReturn.executeGraphQL = rawGraphQL;

    return contextToReturn;
  };

  const createContext = ({
    sessionContext,
    skipAccessControl = false,
    req,
  }: Parameters<CreateContext>[0] = {}): KeystoneContext => {
    const contextToReturn = _prepareContext({ sessionContext, skipAccessControl, req });

    return _bindToContext({ sessionContext, skipAccessControl, req, contextToReturn });
  };

  return createContext;
}
