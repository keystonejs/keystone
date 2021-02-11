import { execute, GraphQLSchema, parse } from 'graphql';
import type {
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

  const _prepareContext = <SessionType>({
    skipAccessControl,
    req,
  }: Parameters<CreateContext<SessionType>>[0]): KeystoneContext => ({
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
    // Note: These two fields let us use the server-side-graphql-client library.
    // We may want to remove them once the updated itemAPI w/ resolveFields is available.
    executeGraphQL: undefined,
    gqlNames: (listKey: string) => keystone.lists[listKey].gqlNames,

    // These properties need to refer to this object. We will bind them later (see _bindToContext)
    session: undefined,
    startSession: undefined,
    endSession: undefined,
    sudo: (() => {}) as KeystoneContext['sudo'],
    exitSudo: (() => {}) as KeystoneContext['exitSudo'],
    withSession: ((() => {}) as unknown) as KeystoneContext['withSession'],
    graphql: {} as KeystoneContext['graphql'],
    lists: {} as KeystoneContext['lists'],
  });

  const _bindToContext = <SessionType>({
    contextToReturn,
    skipAccessControl,
    req,
    res,
    sessionStrategy,
    session,
  }: Parameters<CreateContext<SessionType>>[0] & {
    contextToReturn: KeystoneContext;
    session?: SessionType;
  }) => {
    // Bind session
    contextToReturn.session = session;
    if (sessionStrategy) {
      Object.assign(contextToReturn, {
        startSession: (data: SessionType) =>
          sessionStrategy.start({ res: res!, data, context: contextToReturn }),
        endSession: () => sessionStrategy.end({ req: req!, res: res!, context: contextToReturn }),
      });
    }

    // Bind sudo/leaveSudo/withSession
    // We want .sudo()/.leaveSudo()/.withSession() to be a synchronous functions, so rather
    // than calling createContext, we follow the same steps, but skip the async session object
    // creation, instead passing through the session object we already have, or the paramter
    // for .withSession().
    contextToReturn.sudo = () => {
      const args = { skipAccessControl: true, req, res, sessionStrategy };
      const contextToReturn = _prepareContext(args);
      return _bindToContext({ contextToReturn, ...args, session });
    };
    contextToReturn.exitSudo = () => {
      const args = { skipAccessControl: false, req, res, sessionStrategy };
      const contextToReturn = _prepareContext(args);
      return _bindToContext({ contextToReturn, ...args, session });
    };
    contextToReturn.withSession = session => {
      const args = { skipAccessControl, req, res, sessionStrategy };
      const contextToReturn = _prepareContext(args);
      return _bindToContext({ contextToReturn, ...args, session });
    };

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
    contextToReturn.graphql = {
      createContext,
      raw: rawGraphQL,
      run: runGraphQL,
      schema: graphQLSchema,
    };
    contextToReturn.executeGraphQL = rawGraphQL;

    return contextToReturn;
  };

  const createContext = async <SessionType>({
    skipAccessControl = false,
    req,
    res,
    sessionStrategy,
  }: Parameters<CreateContext<SessionType>>[0] = {}): Promise<KeystoneContext> => {
    const contextToReturn = _prepareContext({ skipAccessControl, req, res, sessionStrategy });

    // Build session if necessary
    const session = sessionStrategy
      ? await sessionStrategy.get({
          req: req!,
          sudoContext: await createContext({
            skipAccessControl: true,
            req,
            res,
            sessionStrategy: undefined,
          }),
        })
      : undefined;

    return _bindToContext({
      contextToReturn,
      skipAccessControl,
      req,
      res,
      sessionStrategy,
      session,
    });
  };

  return createContext;
}
