const cookieSignature = require('cookie-signature');
const express = require('express');
const expressSession = require('express-session');
const bodyParser = require('body-parser');
const cookie = require('cookie');

const commonSessionMiddleware = (keystone, cookieSecret, sessionStore) => {
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
    cookies[COOKIE_NAME] = `s:${cookieSignature.sign(token, cookieSecret)}`;

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
    store: sessionStore,
  });

  return [injectAuthCookieMiddleware, sessionMiddleware, populateAuthedItemMiddleware(keystone)];
};

const formatResponse = (res, htmlResponse, json) =>
  res.format({
    default: htmlResponse,
    'text/html': htmlResponse,
    'application/json': () => res.json(json),
  });

const redirectSuccessfulSignin = (target, req, res) =>
  formatResponse(res, () => res.redirect(target), { success: true });

const signin = (signinPath, successPath, authStrategy, audiences) => async (req, res, next) => {
  try {
    // TODO: How could we support, for example, the twitter auth flow?
    const result = await authStrategy.validate({
      identity: req.body.username,
      secret: req.body.password,
    });

    if (!result.success) {
      // TODO - include some sort of error in the page
      const htmlResponse = () => res.redirect(signinPath);
      return formatResponse(res, htmlResponse, { success: false, message: result.message });
    }

    await startAuthedSession(req, result, audiences);
  } catch (e) {
    return next(e);
  }

  return redirectSuccessfulSignin(successPath, req, res);
};

const signout = async (req, res, next) => {
  let success;
  try {
    await endAuthedSession(req);
    success = true;
  } catch (e) {
    success = false;
    // TODO: Better error logging?
    console.error(e);
  }

  // NOTE: Because session is destroyed here, before webpack can handle the
  // request, the "public" bundle will load the "signed out" page
  return formatResponse(res, () => next(), { success });
};

const session = (req, res) => {
  res.json({
    signedIn: !!req.user,
    user: req.user ? { id: req.user.id, name: req.user.name } : undefined,
  });
};

const createSessionMiddleware = (
  { signinPath, signoutPath, sessionPath, successPath },
  authStrategy,
  audiences
) => {
  const app = express();

  // Listen to POST events for form signin form submission (GET falls through
  // to the webpack server(s))
  app.post(
    signinPath,
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    signin(signinPath, successPath, authStrategy, audiences)
  );

  // Listen to both POST and GET events, and always sign the user out.
  app.use(signoutPath, signout);

  // Allow clients to AJAX for user info
  app.get(sessionPath, session);

  // Short-circuit GET requests when the user already signed in (avoids
  // downloading UI bundle, doing a client side redirect, etc)
  app.get(signinPath, (req, res, next) =>
    req.user ? redirectSuccessfulSignin(successPath, req, res) : next()
  );

  return app;
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
    const item = await list.adapter.findById(req.session.keystoneItemId);
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

function startAuthedSession(req, { item, list }, audiences) {
  return new Promise((resolve, reject) =>
    req.session.regenerate(err => {
      if (err) return reject(err);
      req.session.keystoneListKey = list.key;
      req.session.keystoneItemId = item.id;
      req.session.audiences = audiences;
      resolve();
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
  createSessionMiddleware,
  restrictAudienceMiddleware,
  startAuthedSession,
  endAuthedSession,
};
