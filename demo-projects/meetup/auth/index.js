const { endAuthedSession } = require('@keystone-alpha/session');
const express = require('express');
const authRouter = express.Router();

const createEmailAuthRoutes = require('./emailAuth');

module.exports = function createAuthRoutes(keystone) {
  authRouter.get('/session', (req, res) => {
    const data = {
      signedIn: !!req.session.keystoneItemId,
      userId: req.session.keystoneItemId,
    };
    res.json(data);
  });

  authRouter.get('/signout', async (req, res, next) => {
    try {
      await endAuthedSession(req);
      res.json({
        success: true,
      });
    } catch (e) {
      next(e);
    }
  });

  // Email/Password auth
  authRouter.use('/email', createEmailAuthRoutes(keystone));

  return authRouter;
};
