import Path from 'path';
import url from 'url';
import cors from 'cors';
import next from 'next';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
// @ts-ignore
import { formatError } from '@keystonejs/keystone/lib/Keystone/format-error';
import type { KeystoneSystem } from '@keystone-next/types';

const dev = process.env.NODE_ENV !== 'production';

const addApolloServer = ({ server, system }: { server: any; system: KeystoneSystem }) => {
  const { graphQLSchema, createContextFromRequest } = system;
  const apolloServer = new ApolloServer({
    // FIXME: Support for file handling configuration
    // maxFileSize: 200 * 1024 * 1024,
    // maxFiles: 5,
    schema: graphQLSchema,
    // FIXME: allow the dev to control where/when they get a playground
    playground: { settings: { 'request.credentials': 'same-origin' } },
    formatError, // TODO: this needs to be discussed
    context: ({ req, res }) => createContextFromRequest(req, res),
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
  // FIXME: Support for custom apiPath (config.graphql.path ?), is '/admin/api' in core keystone
  apolloServer.applyMiddleware({ app: server, path: '/api/graphql' });
};

export const createAdminUIServer = async (system: KeystoneSystem) => {
  const server = express();

  // TODO: allow cors to be configured
  server.use(cors({ origin: true, credentials: true }));

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
    const session = (await system.createSessionContext?.(req, res))?.session;
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
