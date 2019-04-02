const keystone = require('@keystone-alpha/core');
const { endAuthedSession } = require('@keystone-alpha/session');
const {
  facebookAuthEnabled,
  githubAuthEnabled,
  twitterAuthEnabled,
  googleAuthEnabled,
  port,
  staticRoute,
  staticPath,
} = require('./config');
const { configureFacebookAuth } = require('./facebook');
const { configureGitHubAuth } = require('./github');
const { configureTwitterAuth } = require('./twitter');
const { configureGoogleAuth } = require('./google');

const initialData = require('./data');

keystone
  .prepare({ port })
  .then(async ({ server, keystone: keystoneApp }) => {
    server.app.get('/reset-db', async (req, res) => {
      Object.values(keystoneApp.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await keystoneApp.createItems(initialData);
      res.redirect('/admin');
    });

    if (facebookAuthEnabled) {
      configureFacebookAuth(keystoneApp, server);
    }

    if (githubAuthEnabled) {
      configureGitHubAuth(keystoneApp, server);
    }

    if (twitterAuthEnabled) {
      configureTwitterAuth(keystoneApp, server);
    }

    if (googleAuthEnabled) {
      configureGoogleAuth(keystoneApp, server);
    }

    server.app.use(staticRoute, server.express.static(staticPath));

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

    await server.start();

    // Initialise some data.
    // NOTE: This is only for test purposes and should not be used in production
    const users = await keystoneApp.lists.User.adapter.findAll();
    if (!users.length) {
      Object.values(keystoneApp.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await keystoneApp.createItems(initialData);
    }
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
