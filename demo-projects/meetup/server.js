const keystone = require('@keystone-alpha/core');
const { Wysiwyg } = require('@keystone-alpha/fields-wysiwyg-tinymce');
const next = require('next');
const createAuthRoutes = require('./auth');
const initialData = require('./initialData');

const port = process.env.PORT || 3000;

const nextApp = next({
  dir: 'site',
  distDir: 'build',
  dev: process.env.NODE_ENV !== 'production',
});

Promise.all([keystone.prepare({ port }), nextApp.prepare()])
  .then(async ([{ server, keystone: keystoneApp }]) => {
    await keystoneApp.connect();

    // Attach the auth routes
    server.app.use('/auth', createAuthRoutes(keystone));

    server.app.get('/event/:id', (req, res) => {
      const { id } = req.params;
      nextApp.render(req, res, '/event', { id, ...req.query });
    });

    // Initialise some data.
    // NOTE: This is only for demo purposes and should not be used in production
    const users = await keystoneApp.lists.User.adapter.findAll();
    if (!users.length) {
      await keystoneApp.createItems(initialData);
    }

    Wysiwyg.bindStaticMiddleware(server);
    server.app.use(nextApp.getRequestHandler());
    await server.start();
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
