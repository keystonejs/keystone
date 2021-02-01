import url from 'url';
import next from 'next';
import express from 'express';
import type { KeystoneConfig, SessionImplementation, CreateContext } from '@keystone-next/types';

export const createAdminUIServer = async (
  ui: KeystoneConfig['ui'],
  createContext: CreateContext,
  dev: boolean,
  projectAdminPath: string,
  sessionImplementation?: SessionImplementation
) => {
  const app = next({ dev, dir: projectAdminPath });
  const handle = app.getRequestHandler();
  await app.prepare();

  const publicPages = ui?.publicPages ?? [];
  return async (req: express.Request, res: express.Response) => {
    const { pathname } = url.parse(req.url);
    if (pathname?.startsWith('/_next')) {
      handle(req, res);
      return;
    }
    const context = createContext({
      sessionContext: await sessionImplementation?.createSessionContext(req, res, createContext),
    });
    const isValidSession = ui?.isAccessAllowed
      ? await ui.isAccessAllowed(context)
      : context.session !== undefined;
    const maybeRedirect = await ui?.pageMiddleware?.({
      req,
      session: context.session,
      isValidSession,
      createContext,
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
  };
};
