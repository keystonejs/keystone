import cors, { CorsOptions } from 'cors';
import express from 'express';
import { GraphQLSchema } from 'graphql';
import { graphqlUploadExpress } from 'graphql-upload';
import type { KeystoneConfig, CreateContext, SessionStrategy } from '@keystone-next/types';
import { createAdminUIServer } from '@keystone-next/admin-ui/system';
import { createApolloServerExpress } from './createApolloServer';

const addApolloServer = ({
  server,
  graphQLSchema,
  createContext,
  sessionStrategy,
}: {
  server: express.Express;
  graphQLSchema: GraphQLSchema;
  createContext: CreateContext;
  sessionStrategy?: SessionStrategy<any>;
}) => {
  const apolloServer = createApolloServerExpress({ graphQLSchema, createContext, sessionStrategy });
  server.use(graphqlUploadExpress());
  apolloServer.applyMiddleware({ app: server, path: '/api/graphql', cors: false });
};

export const createExpressServer = async (
  config: KeystoneConfig,
  graphQLSchema: GraphQLSchema,
  createContext: CreateContext,
  dev: boolean,
  projectAdminPath: string,
  isVerbose: boolean = true
) => {
  const server = express();

  if (config.server?.cors) {
    // Setting config.server.cors = true will provide backwards compatible defaults
    // Otherwise, the user can provide their own config object to use
    const corsConfig: CorsOptions =
      typeof config.server.cors === 'boolean'
        ? { origin: true, credentials: true }
        : config.server.cors;
    server.use(cors(corsConfig));
  }

  const sessionStrategy = config.session ? config.session() : undefined;

  if (isVerbose) console.log('✨ Preparing GraphQL Server');
  addApolloServer({ server, graphQLSchema, createContext, sessionStrategy });

  if (config.ui?.isDisabled) {
    if (isVerbose) console.log('✨ Skipping Admin UI app');
  } else {
    if (isVerbose) console.log('✨ Preparing Admin UI Next.js app');
    server.use(
      await createAdminUIServer(config.ui, createContext, dev, projectAdminPath, sessionStrategy)
    );
  }

  return server;
};
