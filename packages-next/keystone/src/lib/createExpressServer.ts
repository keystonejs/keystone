import type { IncomingMessage, ServerResponse } from 'http';
import Path from 'path';
import url from 'url';
import cors from 'cors';
import next from 'next';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
// @ts-ignore
import { formatError } from '@keystonejs/keystone/lib/Keystone/format-error';
import type { KeystoneSystem, KeystoneConfig } from '@keystone-next/types';

const dev = process.env.NODE_ENV !== 'production';

const addApolloServer = ({ server, system }: { server: any; system: KeystoneSystem }) => {
  const { graphQLSchema, createContext, sessionImplementation } = system;
  const apolloServer = new ApolloServer({
    // FIXME: Support for file handling configuration
    // maxFileSize: 200 * 1024 * 1024,
    // maxFiles: 5,
    schema: graphQLSchema,
    // FIXME: allow the dev to control where/when they get a playground
    playground: { settings: { 'request.credentials': 'same-origin' } },
    formatError, // TODO: this needs to be discussed
    context: async ({ req, res }: { req: IncomingMessage; res: ServerResponse }) =>
      createContext({
        sessionContext: await sessionImplementation?.createContext(req, res, system),
      }),
    // FIXME: support for apollo studio tracing
    // ...(process.env.ENGINE_API_KEY || process.env.APOLLO_KEY
    //   ? { tracing: true }
    //   : {
    //       engine: false,
    //       // Only enable tracing in dev mode so we can get local debug info, but
    //       // don't bother returning that info on prod when the `engine` is
    //       // disabled.
    //       tracing: dev,
    //     }),
    // FIXME: Support for generic custom apollo configuration
    // ...apolloConfig,
  });
  // FIXME: Support custom API path via config.graphql.path.
  // Note: Core keystone uses '/admin/api' as the default.
  apolloServer.applyMiddleware({ app: server, path: '/api/graphql', cors: false });
};

export const createExpressServer = async (config: KeystoneConfig, system: KeystoneSystem) => {
  const server = express();

  if (config.server?.cors) {
    // Setting config.server.cors = true will provide backwards compatible defaults
    // Otherwise, the user can provide their own config object to use
    const corsConfig =
      typeof config.server.cors === 'boolean'
        ? { origin: true, credentials: true }
        : config.server.cors;
    server.use(cors(corsConfig));
  }

  console.log('✨ Preparing Next.js app');
  const app = next({ dev, dir: Path.join(process.cwd(), '.keystone', 'admin') });
  const handle = app.getRequestHandler();
  await Promise.all([app.prepare(), system.keystone.connect()]);

  console.log('✨ Preparing GraphQL Server');
  addApolloServer({ server, system });

  const publicPages = system.config.ui?.publicPages ?? [];

  server.use(async (req, res) => {
    const { pathname } = url.parse(req.url);
    if (pathname?.startsWith('/_next')) {
      handle(req, res);
      return;
    }
    const session = (await system.sessionImplementation?.createContext?.(req, res, system))
      ?.session;
    const isValidSession = system.config.ui?.isAccessAllowed
      ? await system.config.ui.isAccessAllowed({ session })
      : session !== undefined;
    const maybeRedirect = await system.config.ui?.pageMiddleware?.({
      req,
      session,
      isValidSession,
      system,
    });
    if (maybeRedirect) {
      res.redirect(maybeRedirect.to);
      return;
    }
    if (!isValidSession && !publicPages.includes(url.parse(req.url).pathname!)) {
      app.render(req, res, '/no-access');
    } else {
      handle(req, res);
    }
  });

  return server;
};
