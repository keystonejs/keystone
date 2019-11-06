const cookieSignature = require('cookie-signature');
const expressSession = require('express-session');
const cookie = require('cookie');

const commonSessionMiddleware = ({
  keystone,
  cookieSecret,
  sessionStore,
  secureCookies,
  cookieMaxAge,
}) => {
  const COOKIE_NAME = 'keystone.sid';

  // We have at least one auth strategy
  // Setup the session as the very first thing.
  // The way express works, the `req.session` (and, really, anything added
  // to `req`) will be available to all sub `express()` instances.
  // This way, we have one global setting for authentication / sessions that
  // all routes on the server can utilize.
  function injectAuthCookieMiddleware(req, res, next) {
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
  }

  const sessionMiddleware = expressSession({
    secret: cookieSecret,
    resave: false,
    saveUninitialized: false,
    name: COOKIE_NAME,
    cookie: { secure: secureCookies, maxAge: cookieMaxAge },
    store: sessionStore,
  });

  return [injectAuthCookieMiddleware, sessionMiddleware, populateAuthedItemMiddleware(keystone)];
};

function populateAuthedItemMiddleware(keystone) {
  return async (req, res, next) => {
    if (!req.session || !req.session.keystoneItemId) {
      return next();
    }
    const list = keystone.lists[req.session.keystoneListKey];
    if (!list) {
      // TODO: probably destroy the session
      return next();
    }
    let item;
    try {
      item = await list.getAccessControlledItem(req.session.keystoneItemId, true, {
        operation: 'read',
        context: {},
        info: {},
      });
    } catch (e) {
      // If the item no longer exists, getAccessControlledItem() will throw an exception
      return next();
    }
    if (!item) {
      // TODO: probably destroy the session
      return next();
    }
    req.user = item;
    req.authedListKey = list.key;
    req.audiences = req.session.audiences;

    next();
  };
}

function restrictAudienceMiddleware({ isPublic, audiences }) {
  return (req, res, next) => {
    if (isPublic) {
      // If the session restriction is marked public, we let everything through.
      next();
    } else if (
      req.audiences &&
      audiences &&
      Array.isArray(audiences) &&
      req.audiences.some(audience => audiences.includes(audience))
    ) {
      // Otherwise, if one of the session audiences matches one of the restriction audiences, we let them through.
      next();
    } else {
      // If the don't make it through, we simply respond with a 403 Permission Denied
      res.status(403).send();
    }
  };
}

function startAuthedSession(req, { item, list }, audiences, cookieSecret) {
  return new Promise((resolve, reject) =>
    req.session.regenerate(err => {
      if (err) return reject(err);
      req.session.keystoneListKey = list.key;
      req.session.keystoneItemId = item.id;
      req.session.audiences = audiences;
      resolve(cookieSignature.sign(req.session.id, cookieSecret));
    })
  );
}

function endAuthedSession(req) {
  return new Promise((resolve, reject) =>
    req.session.regenerate(err => {
      if (err) return reject(err);
      resolve({ success: true });
    })
  );
}

module.exports = {
  commonSessionMiddleware,
  restrictAudienceMiddleware,
  startAuthedSession,
  endAuthedSession,
};
