const express = require('express');
const bodyParser = require('body-parser');

const formatResponse = (res, htmlResponse, json) =>
  res.format({
    default: htmlResponse,
    'text/html': htmlResponse,
    'application/json': () => res.json(json),
  });

const redirectSuccessfulSignin = (target, req, res) =>
  formatResponse(res, () => res.redirect(target), { success: true });

const signin = (signinPath, successPath, sessionManager, authStrategy) => async (
  req,
  res,
  next
) => {
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

    await sessionManager.startAuthedSession(req, result);
  } catch (e) {
    return next(e);
  }

  return redirectSuccessfulSignin(successPath, req, res);
};

const signout = sessionManager => async (req, res, next) => {
  let success;
  try {
    await sessionManager.endAuthedSession(req);
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
  sessionManager,
  authStrategy
) => {
  const app = express();

  // Listen to POST events for form signin form submission (GET falls through
  // to the webpack server(s))
  app.post(
    signinPath,
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    signin(signinPath, successPath, sessionManager, authStrategy)
  );

  // Listen to both POST and GET events, and always sign the user out.
  app.use(signoutPath, signout(sessionManager));

  // Allow clients to AJAX for user info
  app.get(sessionPath, session);

  // Short-circuit GET requests when the user already signed in (avoids
  // downloading UI bundle, doing a client side redirect, etc)
  app.get(signinPath, (req, res, next) =>
    req.user ? redirectSuccessfulSignin(successPath, req, res) : next()
  );

  return app;
};

module.exports = {
  createSessionMiddleware,
};
