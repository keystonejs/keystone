import url from 'url';
import path from 'path';
import express from 'express';
import type { KeystoneConfig, CreateContext } from '../../types';
import { createSessionContext } from '../../session';

const adminErrorHTMLFilepath = path.join(
  path.dirname(require.resolve('@keystone-next/keystone/package.json')),
  'static',
  'admin-error.html'
);

export const createAdminUIMiddleware = async (
  config: KeystoneConfig,
  createContext: CreateContext,
  dev: boolean,
  projectAdminPath: string
) => {
  /** We do this to stop webpack from bundling next inside of next */
  const { ui, graphql, session } = config;
  const _next = 'next';
  const next = require(_next);
  const app = next({ dev, dir: projectAdminPath });
  const handle = app.getRequestHandler();
  await app.prepare();

  const publicPages = ui?.publicPages ?? [];
  return async (req: express.Request, res: express.Response) => {
    const { pathname } = url.parse(req.url);
    if (
      pathname?.startsWith('/_next') ||
      pathname === (graphql?.path || '/api/graphql') ||
      pathname === '/api/__keystone_api_build'
    ) {
      handle(req, res);
      return;
    }
    try {
      const context = createContext({
        sessionContext: session
          ? await createSessionContext(session, req, res, createContext)
          : undefined,
        req,
      });
      const isValidSession = ui?.isAccessAllowed
        ? await ui.isAccessAllowed(context)
        : session
        ? context.session !== undefined
        : true;
      const maybeRedirect = await ui?.pageMiddleware?.({ context, isValidSession });
      if (maybeRedirect) {
        res.redirect(maybeRedirect.to);
        return;
      }
      if (!isValidSession && !publicPages.includes(url.parse(req.url).pathname!)) {
        app.render(req, res, '/no-access');
      } else {
        handle(req, res);
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
};
