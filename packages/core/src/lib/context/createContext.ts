import type { IncomingMessage } from 'http';
import { graphql, GraphQLSchema, print } from 'graphql';
import {
  SessionContext,
  KeystoneContext,
  KeystoneGraphQLAPI,
  GqlNames,
  KeystoneConfig,
} from '../../types';

import { PrismaClient } from '../core/utils';
import { InitialisedModel } from '../core/types-for-lists';
import { createImagesContext } from '../assets/createImagesContext';
import { createFilesContext } from '../assets/createFilesContext';
import { getDbAPIFactory, itemAPIForModel } from './itemAPI';

export function makeCreateContext({
  graphQLSchema,
  sudoGraphQLSchema,
  prismaClient,
  gqlNamesByModel,
  config,
  models,
}: {
  graphQLSchema: GraphQLSchema;
  sudoGraphQLSchema: GraphQLSchema;
  config: KeystoneConfig;
  prismaClient: PrismaClient;
  gqlNamesByModel: Record<string, GqlNames>;
  models: Record<string, InitialisedModel>;
}) {
  const images = createImagesContext(config);
  const files = createFilesContext(config);
  // We precompute these helpers here rather than every time createContext is called
  // because they involve creating a new GraphQLSchema, creating a GraphQL document AST(programmatically, not by parsing) and validating the
  // note this isn't as big of an optimisation as you would imagine(at least in comparison with the rest of the system),
  // the regular non-db models api does more expensive things on every call
  // like parsing the generated GraphQL document, and validating it against the schema on _every_ call
  // is that really that bad? no not really. this has just been more optimised because the cost of what it's
  // doing is more obvious(even though in reality it's much smaller than the alternative)

  const publicDbApiFactories: Record<string, ReturnType<typeof getDbAPIFactory>> = {};
  for (const [modelKey, gqlNames] of Object.entries(gqlNamesByModel)) {
    publicDbApiFactories[modelKey] = getDbAPIFactory(gqlNames, graphQLSchema);
  }

  const sudoDbApiFactories: Record<string, ReturnType<typeof getDbAPIFactory>> = {};
  for (const [modelKey, gqlNames] of Object.entries(gqlNamesByModel)) {
    sudoDbApiFactories[modelKey] = getDbAPIFactory(gqlNames, sudoGraphQLSchema);
  }

  const createContext = ({
    sessionContext,
    sudo = false,
    req,
  }: {
    sessionContext?: SessionContext<any>;
    sudo?: Boolean;
    req?: IncomingMessage;
  } = {}): KeystoneContext => {
    const schema = sudo ? sudoGraphQLSchema : graphQLSchema;

    const rawGraphQL: KeystoneGraphQLAPI['raw'] = ({ query, variables }) => {
      const source = typeof query === 'string' ? query : print(query);
      return Promise.resolve(
        graphql({ schema, source, contextValue: contextToReturn, variableValues: variables })
      );
    };
    const runGraphQL: KeystoneGraphQLAPI['run'] = async ({ query, variables }) => {
      let result = await rawGraphQL({ query, variables });
      if (result.errors?.length) {
        throw result.errors[0];
      }
      return result.data as Record<string, any>;
    };
    const dbAPI: KeystoneContext['db'] = {};
    const itemAPI: KeystoneContext['query'] = {};
    const contextToReturn: KeystoneContext = {
      db: dbAPI,
      query: itemAPI,
      totalResults: 0,
      prisma: prismaClient,
      graphql: { raw: rawGraphQL, run: runGraphQL, schema },
      maxTotalResults: config.graphql?.queryLimits?.maxTotalResults ?? Infinity,
      sudo: () => createContext({ sessionContext, sudo: true, req }),
      exitSudo: () => createContext({ sessionContext, sudo: false, req }),
      withSession: session =>
        createContext({
          sessionContext: { ...sessionContext, session } as SessionContext<any>,
          sudo,
          req,
        }),
      req,
      ...sessionContext,
      // Note: This field lets us use the server-side-graphql-client library.
      // We may want to remove it once the updated itemAPI w/ query is available.
      gqlNames: (modelKey: string) => gqlNamesByModel[modelKey],
      images,
      files,
    };
    if (config.experimental?.contextInitialisedModels) {
      contextToReturn.experimental = { initialisedModels: models };
    }

    const dbAPIFactories = sudo ? sudoDbApiFactories : publicDbApiFactories;
    for (const modelKey of Object.keys(gqlNamesByModel)) {
      dbAPI[modelKey] = dbAPIFactories[modelKey](contextToReturn);
      itemAPI[modelKey] = itemAPIForModel(modelKey, contextToReturn);
    }
    return contextToReturn;
  };

  return createContext;
}
