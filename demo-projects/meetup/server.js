const keystone = require('@keystone-alpha/core');
const { Wysiwyg } = require('@keystone-alpha/fields-wysiwyg-tinymce');
const next = require('next');
const createAuthRoutes = require('./auth');
const initialData = require('./initialData');
const routes = require('./routes');

const port = process.env.PORT || 3000;

const nextApp = next({
  dir: 'site',
  distDir: 'build',
  dev: process.env.NODE_ENV !== 'production',
});
const handler = routes.getRequestHandler(nextApp);

Promise.all([keystone.prepare({ port }), nextApp.prepare()])
  .then(async ([{ server, keystone: keystoneApp }]) => {
    await keystoneApp.connect();

    // Attach the auth routes
    server.app.use('/', createAuthRoutes(keystone));

    // Initialise some data.
    // NOTE: This is only for demo purposes and should not be used in production
    const users = await keystoneApp.lists.User.adapter.findAll();
    if (!users.length) {
      Object.values(keystoneApp.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await keystoneApp.createItems(initialData);
    }

    Wysiwyg.bindStaticMiddleware(server);
    server.app.use(handler);
    await server.start();
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
