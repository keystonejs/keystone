import url from 'url';
import express from 'express';
import type { KeystoneConfig, SessionStrategy, CreateContext } from '../../types';
import { createSessionContext } from '../../session';

export const createAdminUIServer = async (
  config: KeystoneConfig,
  createContext: CreateContext,
  dev: boolean,
  projectAdminPath: string,
  sessionStrategy?: SessionStrategy<any>
) => {
  /** We do this to stop webpack from bundling next inside of next */
  const { ui, graphql } = config;
  const thing = 'next';
  const next = require(thing);
  const app = next({ dev, dir: projectAdminPath });
  const handle = app.getRequestHandler();
  await app.prepare();

  const publicPages = ui?.publicPages ?? [];
  return async (req: express.Request, res: express.Response) => {
    const { pathname } = url.parse(req.url);
    if (pathname?.startsWith('/_next') || pathname === (graphql?.path || '/api/graphql')) {
      handle(req, res);
      return;
    }
    const context = createContext({
      sessionContext: sessionStrategy
        ? await createSessionContext(sessionStrategy, req, res, createContext)
        : undefined,
      req,
    });
    const isValidSession = ui?.isAccessAllowed
      ? await ui.isAccessAllowed(context)
      : sessionStrategy
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
  };
};
