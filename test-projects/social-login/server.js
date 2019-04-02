const keystone = require('@keystone-alpha/core');

const { facebookAuthEnabled, githubAuthEnabled, port, staticRoute, staticPath } = require('./config');
const { configureFacebookAuth } = require('./facebook');
const { configureGitHubAuth } = require('./github');

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

    server.app.use(staticRoute, server.express.static(staticPath));

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
