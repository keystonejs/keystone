// @ts-ignore
import cookieSignature from 'cookie-signature';
import expressSession from 'express-session';
import type { SessionOptions } from 'express-session';
import { Request, Response, NextFunction } from 'express';
import cookie from 'cookie';

// FIXME: In the future this types will need to come from Keystone itself.
type _Item = { id: string };
type _List = {
  key: string;
  adapter: { itemsQuery: (args: { where: { id: string } }) => Promise<_Item[]> };
};
type _Keystone = { lists: Record<string, _List> };

export class SessionManager {
  _cookieSecret: SessionOptions['secret'];
  _cookie: SessionOptions['cookie'];
  _sessionStore: SessionOptions['store'];

  constructor({
    cookieSecret,
    cookie,
    sessionStore,
  }: {
    cookieSecret: SessionOptions['secret'];
    cookie: SessionOptions['cookie'];
    sessionStore: SessionOptions['store'];
  }) {
    if (!cookieSecret) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'The cookieSecret config option is required when running Keystone in a production environment. Update your app or environment config so this value is supplied to the Keystone constructor. See [https://www.keystonejs.com/keystonejs/keystone/#cookiesecret] for details.'
        );
      } else {
        console.warn(
          'No cookieSecret value was provided. Please generate a secure value and add it to your app. Until this is done, a random cookieSecret will be generated each time Keystone is started. This will cause sessions to be reset between restarts. See [https://www.keystonejs.com/keystonejs/keystone/#cookiesecret] for details.'
        );

        cookieSecret = [...Array(30)].map(() => ((Math.random() * 36) | 0).toString(36)).join('');
      }
    }

    this._cookieSecret = cookieSecret;
    this._cookie = cookie;
    this._sessionStore = sessionStore;
  }

  getSessionMiddleware({ keystone }: { keystone: _Keystone }) {
    const COOKIE_NAME = 'keystone.sid';

    // We have at least one auth strategy
    // Setup the session as the very first thing.
    // The way express works, the `req.session` (and, really, anything added
    // to `req`) will be available to all sub `express()` instances.
    // This way, we have one global setting for authentication / sessions that
    // all routes on the server can utilize.
    const injectAuthCookieMiddleware = (req: Request, res: Response, next: NextFunction) => {
      if (!req.headers) {
        return next();
      }

      let authHeader = req.headers.authorization || req.headers.Authorization;

      if (!authHeader) {
        return next();
      }
      if (Array.isArray(authHeader)) {
        authHeader = authHeader[0];
      }
      const [type, token] = authHeader.split(' ');

      if (type !== 'Bearer') {
        // TODO: Use logger
        console.warn(`Got Authorization header of type ${type}, but expected Bearer`);
        return next();
      }

      // Split the cookies out
      const cookies = cookie.parse(req.headers.cookie || '');

      // Construct a "fake" session cookie based on the authorization token
      cookies[COOKIE_NAME] = `s:${token}`;

      // Then reset the cookies so the session middleware can read it.
      req.headers.cookie = Object.entries(cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');

      // Always call next
      next();
    };

    const sessionMiddleware = expressSession({
      secret: this._cookieSecret,
      resave: false,
      saveUninitialized: false,
      name: COOKIE_NAME,
      cookie: this._cookie,
      store: this._sessionStore,
    });

    const _populateAuthedItemMiddleware = async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      const item = await this._getAuthedItem(req, keystone);
      if (!item) {
        // TODO: probably destroy the session
        return next();
      }

      (req as any).user = item;
      (req as any).authedListKey = (req.session as any).keystoneListKey;

      next();
    };

    return [injectAuthCookieMiddleware, sessionMiddleware, _populateAuthedItemMiddleware];
  }

  async _getAuthedItem(req: Request, keystone: _Keystone) {
    const session = req.session as any;
    if (!session || !session.keystoneItemId) {
      return;
    }
    const list = keystone.lists[session.keystoneListKey];
    if (!list) {
      return;
    }
    let item: _Item | undefined;
    try {
      item = (await list.adapter.itemsQuery({ where: { id: session.keystoneItemId } }))[0];
    } catch (e) {
      return;
    }
    if (!item) {
      return;
    }
    return item;
  }

  startAuthedSession(req: Request, { item, list }: { item: _Item; list: _List }) {
    return new Promise((resolve, reject) =>
      req.session.regenerate(err => {
        if (err) return reject(err);
        (req.session as any).keystoneListKey = list.key;
        (req.session as any).keystoneItemId = item.id;
        resolve(cookieSignature.sign(req.session.id, this._cookieSecret));
      })
    );
  }

  endAuthedSession(req: Request): Promise<{ success: boolean; listKey: string; itemId: string }> {
    const { keystoneListKey, keystoneItemId } = (req.session as any) || {};
    return new Promise((resolve, reject) =>
      req.session.regenerate(err => {
        if (err) return reject(err);
        resolve({ success: true, listKey: keystoneListKey, itemId: keystoneItemId });
      })
    );
  }

  getContext(req: Request) {
    return {
      startAuthedSession: ({ item, list }: { item: _Item; list: _List }) =>
        this.startAuthedSession(req, { item, list }),
      endAuthedSession: () => this.endAuthedSession(req),
    };
  }
}
