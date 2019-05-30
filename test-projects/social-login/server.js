const express = require('express');
const { endAuthedSession } = require('@keystone-alpha/session');

const { keystone, apps } = require('./index');
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
  .prepare({
    apps,
    dev: process.env.NODE_ENV !== 'production',
  })
  .then(async ({ middlewares }) => {
    const socialLogins = [];
    if (facebookAuthEnabled) {
      socialLogins.push(configureFacebookAuth(keystone));
    }

    if (githubAuthEnabled) {
      socialLogins.push(configureGitHubAuth(keystone));
    }

    if (twitterAuthEnabled) {
      socialLogins.push(configureTwitterAuth(keystone));
    }

    if (googleAuthEnabled) {
      socialLogins.push(configureGoogleAuth(keystone));
    }

    if (wpAuthEnabled) {
      socialLogins.push(configureWPAuth(keystone));
    }

    await keystone.connect();

    const app = express();

    if (socialLogins.length > 0) {
      InitializePassportAuthStrategies(app);
    }

    socialLogins.forEach(strategy => setupAuthRoutes({ strategy, app }));

    // Initialise some data.
    // NOTE: This is only for test purposes and should not be used in production
    const users = await keystone.lists.User.adapter.findAll();
    if (!users.length) {
      Object.values(keystone.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await keystone.createItems(initialData);
    }

    app.get('/reset-db', async (req, res) => {
      Object.values(keystone.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await keystone.createItems(initialData);
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
