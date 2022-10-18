import type { IncomingMessage, ServerResponse } from 'http';
import { ExecutionResult, graphql, GraphQLSchema, print } from 'graphql';
import { KeystoneContext, KeystoneGraphQLAPI, GqlNames, KeystoneConfig } from '../../types';

import { PrismaClient } from '../core/utils';
import { InitialisedList } from '../core/types-for-lists';
import { createImagesContext } from '../assets/createImagesContext';
import { createFilesContext } from '../assets/createFilesContext';
import { getDbAPIFactory, itemAPIForList } from './itemAPI';

export function makeCreateContext({
  graphQLSchema,
  sudoGraphQLSchema,
  prismaClient,
  gqlNamesByList,
  config,
  lists,
}: {
  graphQLSchema: GraphQLSchema;
  sudoGraphQLSchema: GraphQLSchema;
  config: KeystoneConfig;
  prismaClient: PrismaClient;
  gqlNamesByList: Record<string, GqlNames>;
  lists: Record<string, InitialisedList>;
}) {
  const images = createImagesContext(config);
  const files = createFilesContext(config);
  // We precompute these helpers here rather than every time createContext is called
  // because they involve creating a new GraphQLSchema, creating a GraphQL document AST(programmatically, not by parsing) and validating the
  // note this isn't as big of an optimisation as you would imagine(at least in comparison with the rest of the system),
  // the regular non-db lists api does more expensive things on every call
  // like parsing the generated GraphQL document, and validating it against the schema on _every_ call
  // is that really that bad? no not really. this has just been more optimised because the cost of what it's
  // doing is more obvious(even though in reality it's much smaller than the alternative)

  const publicDbApiFactories: Record<string, ReturnType<typeof getDbAPIFactory>> = {};
  for (const [listKey, gqlNames] of Object.entries(gqlNamesByList)) {
    publicDbApiFactories[listKey] = getDbAPIFactory(gqlNames, graphQLSchema);
  }

  const sudoDbApiFactories: Record<string, ReturnType<typeof getDbAPIFactory>> = {};
  for (const [listKey, gqlNames] of Object.entries(gqlNamesByList)) {
    sudoDbApiFactories[listKey] = getDbAPIFactory(gqlNames, sudoGraphQLSchema);
  }

  const createContext = ({
    session,
    sudo = false,
    req,
    res,
  }: {
    sudo?: Boolean;
    req?: IncomingMessage;
    res?: ServerResponse;
    session?: any;
  } = {}): KeystoneContext => {
    const schema = sudo ? sudoGraphQLSchema : graphQLSchema;

    const rawGraphQL: KeystoneGraphQLAPI['raw'] = ({ query, variables }) => {
      const source = typeof query === 'string' ? query : print(query);
      return Promise.resolve(
        graphql({
          schema,
          source,
          contextValue: contextToReturn,
          variableValues: variables,
        }) as ExecutionResult<any>
      );
    };
    const runGraphQL: KeystoneGraphQLAPI['run'] = async ({ query, variables }) => {
      let result = await rawGraphQL({ query, variables });
      if (result.errors?.length) {
        throw result.errors[0];
      }
      return result.data as any;
    };

    async function withRequest(req: IncomingMessage, res?: ServerResponse) {
      contextToReturn.req = req;
      contextToReturn.res = res;
      if (!config.session) {
        return contextToReturn;
      }
      contextToReturn.session = await config.session.get({ context: contextToReturn });
      return createContext({ session: contextToReturn.session, sudo, req, res });
    }
    const dbAPI: KeystoneContext['db'] = {};
    const itemAPI: KeystoneContext['query'] = {};
    const contextToReturn: KeystoneContext = {
      db: dbAPI,
      query: itemAPI,
      prisma: prismaClient,
      graphql: { raw: rawGraphQL, run: runGraphQL, schema },
      sessionStrategy: config.session,
      sudo: () => createContext({ sudo: true, req, res }),
      exitSudo: () => createContext({ sudo: false, req, res }),
      withSession: session => {
        return createContext({ session, sudo, req, res });
      },
      req,
      res,
      session,
      withRequest,
      // Note: This field lets us use the server-side-graphql-client library.
      // We may want to remove it once the updated itemAPI w/ query is available.
      gqlNames: (listKey: string) => gqlNamesByList[listKey],
      images,
      files,
    };
    if (config.experimental?.contextInitialisedLists) {
      contextToReturn.experimental = { initialisedLists: lists };
    }

    const dbAPIFactories = sudo ? sudoDbApiFactories : publicDbApiFactories;
    for (const listKey of Object.keys(gqlNamesByList)) {
      dbAPI[listKey] = dbAPIFactories[listKey](contextToReturn);
      itemAPI[listKey] = itemAPIForList(listKey, contextToReturn);
    }
    return contextToReturn;
  };

  return createContext();
}
