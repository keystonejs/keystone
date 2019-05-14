const { endAuthedSession } = require('@keystone-alpha/session');
const express = require('express');
const authRouter = express.Router();

const createEmailAuthRoutes = require('./emailAuth');

module.exports = function createAuthRoutes(keystone) {
  authRouter.get('/session', async (req, res) => {
    const id = req.session.keystoneItemId;
    if (!id) {
      return res.json({
        isSignedIn: false,
        user: null,
      });
    }
    try {
      const user = await keystone.lists.User.adapter.model.findById(id);
      if (!user) {
        return res.json({
          isSignedIn: false,
          user: null,
        });
      }
      const { name, isAdmin } = user;
      res.json({
        isSignedIn: true,
        user: { id, name, isAdmin },
      });
    } catch (e) {
      console.error('An error occurred fetching the current session:', e);
      res.json({
        isSignedIn: false,
      });
    }
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

  // TODO: Social auth (Facebook, Github, Twitter, etc)

  return authRouter;
};
