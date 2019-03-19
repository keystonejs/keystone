const { AdminUI } = require('@keystone-alpha/admin-ui');
const { Keystone } = require('@keystone-alpha/keystone');
const PasswordAuthStrategy = require('@keystone-alpha/keystone/auth/Password');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');
const next = require('next');

const { staticRoute, staticPath, port } = require('./config');
const initialData = require('./initialData');
const { createSchema, createPublicAPI } = require('./schema');

const keystone = new Keystone({
  name: 'Keystone Demo Blog',
  adapter: new MongooseAdapter(),
});

createSchema({ keystone });

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

const admin = new AdminUI(keystone, {
  adminPath: '/admin',
  authStrategy,
  sortListsAlphabetically: true,
});

const nextApp = next({
  dir: 'app',
  distDir: 'build',
  dev: process.env.NODE_ENV !== 'production',
});

// TODO: Not a fan of how unclear it is here that a webserver is being created,
// or where in the middleware stack the items below will be placed.

Promise.all([keystone.prepare({ serverConfig: { admin, port } }), nextApp.prepare()])
  .then(async ([{ server }]) => {
    server.app.use(staticRoute, server.express.static(staticPath));
    server.app.use('/graphql', createPublicAPI({ keystone }));
    server.app.use(nextApp.getRequestHandler());

    await server.start();

    // Initialise some data.
    // NOTE: This is only for demo purposes and should not be used in production
    const users = await keystone.lists.User.adapter.findAll();
    if (!users.length) {
      await keystone.createItems(initialData);
    }

    console.log(`Listening on port ${port}`);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
