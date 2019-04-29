const keystone = require('@keystone-alpha/core');
const { Wysiwyg } = require('@keystone-alpha/fields-wysiwyg-tinymce');

const initialData = require('./initialData');

keystone
  .prepare()
  .then(async ({ server, keystone: keystoneApp }) => {
    await keystoneApp.connect();

    // Initialise some data.
    // NOTE: This is only for demo purposes and should not be used in production
    const users = await keystoneApp.lists.User.adapter.findAll();
    if (!users.length) {
      await keystoneApp.createItems(initialData);
    }

    Wysiwyg.bindStaticMiddleware(server);
    await server.start();
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
