const express = require('express');
const keystone = require('@keystone-alpha/keystone');
const { endAuthedSession } = require('@keystone-alpha/session');
const {
  facebookAuthEnabled,
  githubAuthEnabled,
  twitterAuthEnabled,
  googleAuthEnabled,
  wpAuthEnabled,
  port,
} = require('./config');
const {
  configureFacebookAuth,
  configureGitHubAuth,
  configureGoogleAuth,
  configureTwitterAuth,
  configureWPAuth,
  setupAuthRoutes,
  InitializePassportAuthStrategies,
} = require('./auth');

const initialData = require('./data');
keystone
  .prepare({ port, dev: process.env.NODE_ENV !== 'production' })
  .then(async ({ middlewares, keystone: keystoneApp }) => {
    const socialLogins = [];
    if (facebookAuthEnabled) {
      socialLogins.push(configureFacebookAuth(keystoneApp));
    }

    if (githubAuthEnabled) {
      socialLogins.push(configureGitHubAuth(keystoneApp));
    }

    if (twitterAuthEnabled) {
      socialLogins.push(configureTwitterAuth(keystoneApp));
    }

    if (googleAuthEnabled) {
      socialLogins.push(configureGoogleAuth(keystoneApp));
    }

    if (wpAuthEnabled) {
      socialLogins.push(configureWPAuth(keystoneApp));
    }

    await keystoneApp.connect();

    const app = express();

    if (socialLogins.length > 0) {
      InitializePassportAuthStrategies(app);
    }

    socialLogins.forEach(strategy => setupAuthRoutes({ strategy, app }));

    // Initialise some data.
    // NOTE: This is only for test purposes and should not be used in production
    const users = await keystoneApp.lists.User.adapter.findAll();
    if (!users.length) {
      Object.values(keystoneApp.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await keystoneApp.createItems(initialData);
    }

    app.get('/reset-db', async (req, res) => {
      Object.values(keystoneApp.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await keystoneApp.createItems(initialData);
      res.redirect('/admin');
    });

    app.get('/api/session', (req, res) => {
      res.json({
        signedIn: !!req.session.keystoneItemId,
        userId: req.session.keystoneItemId,
        name: req.user ? req.user.name : undefined,
      });
    });

    app.get('/api/signout', async (req, res, next) => {
      try {
        await endAuthedSession(req);
        res.json({
          success: true,
        });
      } catch (e) {
        next(e);
      }
    });

    app.use(middlewares);

    app.listen(port, error => {
      if (error) throw error;
    });
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
