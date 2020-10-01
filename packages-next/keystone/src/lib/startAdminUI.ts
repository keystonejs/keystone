import express from 'express';
import { ApolloServer } from 'apollo-server-express';
// @ts-ignore
import { formatError } from '@keystonejs/keystone/lib/Keystone/format-error';
import Path from 'path';
import next from 'next';
import type { Keystone } from '@keystone-spike/types';
import url from 'url';

const dev = process.env.NODE_ENV !== 'production';

type Options = {
  port?: number;
};

const defaultOptions: Options = {
  port: 3000,
};

export const startAdminUI = async (options: Options = defaultOptions, keystone: Keystone) => {
  const { port } = options;
  const app = next({ dev, dir: Path.join(process.cwd(), '.keystone', 'admin') });
  const handle = app.getRequestHandler();
  await Promise.all([app.prepare(), keystone.keystone.connect()]);
  const server = express();
  const apolloServer = new ApolloServer({
    schema: keystone.graphQLSchema,
    playground: {
      settings: {
        'request.credentials': 'same-origin',
      },
    },
    // this needs to be discussed
    formatError,
    context: ({ req, res }) => {
      return keystone.createContextFromRequest(req, res);
    },
  });
  apolloServer.applyMiddleware({ app: server, path: '/api/graphql' });

  // TODO: actually get the route
  // const getRouteForPathname = (pathname: string | null) => {
  // if (pathname?.startsWith('/_next') || pathname === null) {
  //   return undefined;
  // }
  // for (const route of app.router.fsRoutes) {
  //   if (route.match(pathname)) {
  //     return { pathname, route };
  //   }
  // }
  // if (app.router.dynamicRoutes) {
  //   for (const route of app.router.dynamicRoutes) {
  //     if (route.match(pathname)) {
  //       return { page: route.page, dynamic: true };
  //     }
  //   }
  // }
  // };

  const publicPages = keystone.config.admin?.publicPages ?? [];

  server.use(async (req, res) => {
    const { pathname } = url.parse(req.url);
    if (pathname?.startsWith('/_next')) {
      handle(req, res);
      return;
    }
    const session = (await keystone.createSessionContext?.(req, res))?.session;
    const isValidSession = keystone.config.admin?.isAccessAllowed
      ? await keystone.config.admin.isAccessAllowed({ session })
      : session !== undefined;
    const maybeRedirect = await keystone.config.admin?.pageMiddleware?.({
      req,
      session,
      isValidSession,
      keystone,
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
  server.listen(port, (err?: any) => {
    if (err) throw err;
    console.log(`👋 Admin UI Ready on http://localhost:${port}`);
  });
};
