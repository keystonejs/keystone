const keystone = require('@keystone-alpha/core');
const { endAuthedSession } = require('@keystone-alpha/session');
const {
  facebookAuthEnabled,
  githubAuthEnabled,
  twitterAuthEnabled,
  googleAuthEnabled,
  wpAuthEnabled,
  port,
  staticRoute,
  staticPath,
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
  .prepare({ port })
  .then(async ({ server, keystone: keystoneApp }) => {
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

    if (socialLogins.length > 0) {
      InitializePassportAuthStrategies(server.app);
    }

    socialLogins.forEach(strategy => setupAuthRoutes({ strategy, server }));

    // Initialise some data.
    // NOTE: This is only for test purposes and should not be used in production
    const users = await keystoneApp.lists.User.adapter.findAll();
    if (!users.length) {
      Object.values(keystoneApp.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await keystoneApp.createItems(initialData);
    }

    server.app.get('/reset-db', async (req, res) => {
      Object.values(keystoneApp.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await keystoneApp.createItems(initialData);
      res.redirect('/admin');
    });

    server.app.get('/api/session', (req, res) => {
      res.json({
        signedIn: !!req.session.keystoneItemId,
        userId: req.session.keystoneItemId,
        name: req.user ? req.user.name : undefined,
      });
    });

    server.app.get('/api/signout', async (req, res, next) => {
      try {
        await endAuthedSession(req);
        res.json({
          success: true,
        });
      } catch (e) {
        next(e);
      }
    });

    server.app.use(staticRoute, server.express.static(staticPath));
    await server.start();
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
