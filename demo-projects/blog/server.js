const keystone = require('@keystone-alpha/core');
const WysiwygField = require('@keystone-alpha/fields-wysiwyg-tinymce');
const next = require('next');

const { staticRoute, staticPath } = require('./index');

const PORT = process.env.PORT || 3000;

const initialData = {
  User: [
    {
      name: 'Administrator',
      email: 'admin@keystone.project',
      isAdmin: true,
      dob: '1990-01-01',
      password: 'password',
    },
    {
      name: 'Demo User',
      email: 'a@demo.user',
      isAdmin: false,
      dob: '1995-06-09',
      password: 'password',
    },
  ],
};

const nextApp = next({
  dir: 'app',
  distDir: 'build',
  dev: process.env.NODE_ENV !== 'production',
});

Promise.all([keystone.prepare({ port: PORT }), nextApp.prepare()])
  .then(async ([{ server, keystone: keystoneApp }]) => {
    WysiwygField.bindStaticMiddleware(server);
    server.app.use(staticRoute, server.express.static(staticPath));
    server.app.use(nextApp.getRequestHandler());

    await server.start();

    // Initialise some data.
    // NOTE: This is only for demo purposes and should not be used in production
    const users = await keystoneApp.lists.User.adapter.findAll();
    if (!users.length) {
      await keystoneApp.createItems(initialData);
    }
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
