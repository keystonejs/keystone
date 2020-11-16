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

export const createAdminUIServer = async (system: KeystoneSystem) => {
  const server = express();

  // TODO: allow cors to be configured
  server.use(cors({ origin: true, credentials: true }));

  console.log('✨ Preparing Next.js app');
  const app = next({ dev, dir: Path.join(process.cwd(), '.keystone', 'admin') });
  const handle = app.getRequestHandler();
  await Promise.all([app.prepare(), system.keystone.connect()]);

  console.log('✨ Preparing GraphQL Server');
  const apolloServer = new ApolloServer({
    schema: system.graphQLSchema,
    playground: { settings: { 'request.credentials': 'same-origin' } },
    // TODO: this needs to be discussed
    formatError,
    context: ({ req, res }) => system.createContextFromRequest(req, res),
  });
  apolloServer.applyMiddleware({ app: server, path: '/api/graphql' });

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
