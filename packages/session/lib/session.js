const cookieSignature = require('cookie-signature');
const expressSession = require('express-session');
const cookie = require('cookie');

class SessionManager {
  constructor({ cookieSecret, cookie, sessionStore }) {
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

  getSessionMiddleware({ keystone }) {
    const COOKIE_NAME = 'keystone.sid';

    // We have at least one auth strategy
    // Setup the session as the very first thing.
    // The way express works, the `req.session` (and, really, anything added
    // to `req`) will be available to all sub `express()` instances.
    // This way, we have one global setting for authentication / sessions that
    // all routes on the server can utilize.
    const injectAuthCookieMiddleware = (req, res, next) => {
      if (!req.headers) {
        return next();
      }

      const authHeader = req.headers.authorization || req.headers.Authorization;

      if (!authHeader) {
        return next();
      }

      const [type, token] = req.headers['authorization'].split(' ');

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

    const _populateAuthedItemMiddleware = async (req, res, next) => {
      const item = await this._getAuthedItem(req, keystone);
      if (!item) {
        // TODO: probably destroy the session
        return next();
      }

      req.user = item;
      req.authedListKey = req.session.keystoneListKey;

      next();
    };

    return [injectAuthCookieMiddleware, sessionMiddleware, _populateAuthedItemMiddleware];
  }

  async _getAuthedItem(req, keystone) {
    if (!req.session || !req.session.keystoneItemId) {
      return;
    }
    const list = keystone.lists[req.session.keystoneListKey];
    if (!list) {
      return;
    }
    let item;
    try {
      item = (await list.adapter.itemsQuery({ where: { id: req.session.keystoneItemId } }))[0];
    } catch (e) {
      return;
    }
    if (!item) {
      return;
    }
    return item;
  }

  startAuthedSession(req, { item, list }) {
    return new Promise((resolve, reject) =>
      req.session.regenerate(err => {
        if (err) return reject(err);
        req.session.keystoneListKey = list.key;
        req.session.keystoneItemId = item.id;
        resolve(cookieSignature.sign(req.session.id, this._cookieSecret));
      })
    );
  }

  endAuthedSession(req) {
    return new Promise((resolve, reject) =>
      req.session.regenerate(err => {
        if (err) return reject(err);
        resolve({ success: true });
      })
    );
  }

  getContext(req) {
    return {
      startAuthedSession: ({ item, list }) => this.startAuthedSession(req, { item, list }),
      endAuthedSession: () => this.endAuthedSession(req),
    };
  }
}

module.exports = { SessionManager };
