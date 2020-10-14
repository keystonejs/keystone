import express from 'express';
import { ApolloServer } from 'apollo-server-express';
// @ts-ignore
import { formatError } from '@keystonejs/keystone/lib/Keystone/format-error';
import Path from 'path';
import next from 'next';
import type { Keystone } from '@keystone-spike/types';
import url from 'url';

const dev = process.env.NODE_ENV !== 'production';

export const createAdminUIServer = async (keystone: Keystone) => {
  const server = express();

  console.log('✨ Preparing Next.js app');
  const app = next({ dev, dir: Path.join(process.cwd(), '.keystone', 'admin') });
  const handle = app.getRequestHandler();
  await Promise.all([app.prepare(), keystone.keystone.connect()]);

  console.log('✨ Preparing GraphQL Server');
  const apolloServer = new ApolloServer({
    schema: keystone.graphQLSchema,
    playground: {
      settings: {
        'request.credentials': 'same-origin',
      },
    },
    // TODO: this needs to be discussed
    formatError,
    context: ({ req, res }) => {
      return keystone.createContextFromRequest(req, res);
    },
  });
  apolloServer.applyMiddleware({ app: server, path: '/api/graphql' });

  const publicPages = keystone.config.admin?.publicPages ?? [];

  server.use(async (req, res) => {
    const { pathname } = url.parse(req.url);
    if (pathname?.startsWith('/_next')) {
      handle(req, res);
      return;
    }
    const session = (await keystone.createSessionContext?.(req, res))?.session;
    console.log(`session:`, session);
    const isValidSession = keystone.config.admin?.isAccessAllowed
      ? await keystone.config.admin.isAccessAllowed({ session })
      : session !== undefined;
    console.log(`isValidSession: ${isValidSession}`);
    console.log(`pageMiddleware:`, keystone.config.admin?.pageMiddleware);
    const maybeRedirect = await keystone.config.admin?.pageMiddleware?.({
      req,
      session,
      isValidSession,
      keystone,
    });
    console.log(`maybeRedirect:`, maybeRedirect);
    if (maybeRedirect) {
      res.redirect(maybeRedirect.to);
      return;
    }
    console.log(`publicPages:`, publicPages);
    console.log(`url: ${req.url}`);
    console.log(`pathname: ${url.parse(req.url).pathname}`);
    if (!isValidSession && !publicPages.includes(url.parse(req.url).pathname!)) {
      app.render(req, res, '/no-access');
    } else {
      handle(req, res);
    }
  });

  return server;
};
