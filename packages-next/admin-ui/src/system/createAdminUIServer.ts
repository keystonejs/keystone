import Path from 'path';
import url from 'url';
import next from 'next';
import express from 'express';
import type { KeystoneSystem } from '@keystone-next/types';

const dev = process.env.NODE_ENV !== 'production';

export const createAdminUIServer = async (system: KeystoneSystem) => {
  const app = next({ dev, dir: Path.join(process.cwd(), '.keystone', 'admin') });
  const handle = app.getRequestHandler();
  await app.prepare();

  const publicPages = system.config.ui?.publicPages ?? [];
  return async (req: express.Request, res: express.Response) => {
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
  };
};
