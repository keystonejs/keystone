const keystone = require('@keystone-alpha/core');
const { Wysiwyg } = require('@keystone-alpha/fields-wysiwyg-tinymce');
const bodyParser = require('body-parser');

const { port, staticRoute, staticPath } = require('./config');
const initialData = require('./initialData');

const initRoutes = require('./routes');

Promise.all([keystone.prepare({ port })])
  .then(async ([{ server, keystone: keystoneApp }]) => {
    await keystoneApp.connect();
    // Initialise some data.
    // NOTE: This is only for demo purposes and should not be used in production
    const users = await keystoneApp.lists.User.adapter.findAll();
    if (!users.length) {
      await keystoneApp.createItems(initialData);
    }

    Wysiwyg.bindStaticMiddleware(server);
    server.app.use(staticRoute, server.express.static(staticPath));
    server.app.use(bodyParser.urlencoded({ extended: true }));
    server.app.set('views', './templates');
    server.app.set('view engine', 'pug');

    initRoutes(keystoneApp, server.app);

    await server.start();
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
