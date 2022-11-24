import url from 'url';
import path from 'path';
import express from 'express';
import type { KeystoneConfig, KeystoneContext } from '../../types';

const adminErrorHTMLFilepath = path.join(
  path.dirname(require.resolve('@keystone-6/core/package.json')),
  'static',
  'admin-error.html'
);

type NextApp = {
  prepare(): Promise<void>;
  getRequestHandler(): express.Application;
  render(req: express.Request, res: express.Response, url: string): void;
};

export async function getNextApp(dev: boolean, projectAdminPath: string): Promise<NextApp> {
  /** We do this to stop webpack from bundling next inside of next */
  const _next = 'next';
  const next = require(_next);
  const app = next({ dev, dir: projectAdminPath }) as NextApp;
  await app.prepare();
  return app;
}

function defaultIsAccessAllowed({ session, sessionStrategy }: KeystoneContext) {
  if (!sessionStrategy) return true;
  return session !== undefined;
}

export function createAdminUIMiddlewareWithNextApp(
  config: KeystoneConfig,
  context: KeystoneContext,
  nextApp: NextApp
) {
  const handle = nextApp.getRequestHandler();

  const {
    ui: { isAccessAllowed = defaultIsAccessAllowed, pageMiddleware, publicPages = [] } = {},
  } = config;

  return async (req: express.Request, res: express.Response) => {
    const { pathname } = url.parse(req.url);

    if (pathname?.startsWith('/_next') || pathname?.startsWith('/__next')) {
      handle(req, res);
      return;
    }

    try {
      // do nothing if this is a public page
      if (publicPages.includes(pathname!)) {
        handle(req, res);
        return;
      }

      const userContext = await context.withRequest(req, res);
      const isValidSession = await isAccessAllowed(userContext); // TODO: rename "isValidSession" to "wasAccessAllowed"?
      const shouldRedirect = await pageMiddleware?.({
        context,
        isValidSession,
      });

      if (shouldRedirect) {
        res.header('Cache-Control', 'no-cache, max-age=0');
        res.header('Location', shouldRedirect.to);
        res.status(302);
        res.send();
        return;
      }

      if (isValidSession) {
        handle(req, res);
      } else {
        nextApp.render(req, res, '/no-access');
      }
    } catch (e) {
      console.error('An error occurred handling a request for the Admin UI:', e);
      res.status(500);
      res.format({
        'text/html': function () {
          res.sendFile(adminErrorHTMLFilepath);
        },
        'application/json': function () {
          res.send({ error: true });
        },
        default: function () {
          res.send('An error occurred handling a request for the Admin UI.');
        },
      });
    }
  };
}

export async function createAdminUIMiddleware(
  config: KeystoneConfig,
  context: KeystoneContext,
  dev: boolean,
  projectAdminPath: string
) {
  const nextApp = await getNextApp(dev, projectAdminPath);
  return createAdminUIMiddlewareWithNextApp(config, context, nextApp);
}
