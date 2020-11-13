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
import { implementSession } from '../session';

const dev = process.env.NODE_ENV !== 'production';

const addApolloServer = ({ server, graphQLSchema, createContext, sessionImplementation }) => {
  const apolloServer = new ApolloServer({
    // FIXME: Support for file handling configuration
    // maxFileSize: 200 * 1024 * 1024,
    // maxFiles: 5,
    schema: graphQLSchema,
    // FIXME: allow the dev to control where/when they get a playground
    playground: { settings: { 'request.credentials': 'same-origin' } },
    formatError, // TODO: this needs to be discussed
    context: async ({ req, res }) =>
      createContext({
        sessionContext: await sessionImplementation?.getSessionContext(req, res, system),
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

const getAdminUIMiddleware = ({ ui, sessionImplementation }) => {
  const nextApp = next({ dev, dir: Path.join(process.cwd(), '.keystone', 'admin') });
  const handle = nextApp.getRequestHandler();
  await nextApp.prepare();
  return async (req, res) => {
    const { pathname } = url.parse(req.url);
    if (pathname?.startsWith('/_next')) {
      handle(req, res);
      return;
    }

    // Connect and return a session
    const session = (await sessionImplementation?.getSessionContext(req, res, system))?.session;
    const isValidSession = ui?.isAccessAllowed
      ? await ui.isAccessAllowed({ session })
      : session !== undefined;
    const maybeRedirect = await ui?.pageMiddleware?.({ req, session, isValidSession, system });
    if (maybeRedirect) {
      res.redirect(maybeRedirect.to);
      return;
    }
    const publicPages = ui?.publicPages ?? [];
    if (!isValidSession && !publicPages.includes(url.parse(req.url).pathname!)) {
      nextApp.render(req, res, '/no-access');
    } else {
      handle(req, res);
    }
  };
};

export const createExpressServer = async (ui: KeystoneConfig['ui'], system: KeystoneSystem) => {
  const { graphQLSchema, sessionStrategy, createContext } = system;
  const server = express();

  // TODO: allow cors to be configured
  server.use(cors({ origin: true, credentials: true }));

  const sessionImplementation = sessionStrategy ? implementSession(sessionStrategy) : undefined;

  console.log('✨ Preparing GraphQL Server');
  addApolloServer({ server, graphQLSchema, createContext, sessionImplementation });

  // FIXME: This logic should perhaps live in the admin-ui package?
  console.log('✨ Preparing Next.js app');
  const adminUIMiddleware = getAdminUIMiddleware({ ui, sessionImplementation });

  server.use(adminUIMiddleware);

  return server;
};
