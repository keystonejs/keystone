const express = require('express');

const { keystone, apps } = require('./index');
const { port } = require('./config');
const { initialData, initialPosts } = require('./data');

const initialiseLists = (keystone, initialData) => {
  return Promise.all(
    Object.entries(initialData).map(([listName, items]) => {
      const list = keystone.lists[listName];
      return keystone.executeQuery({
        query: `mutation ($items: [${list.gqlNames.createManyInputName}]) { ${list.gqlNames.createManyMutationName}(data: $items) { id } }`,
        schemaName: 'admin',
        variables: { items: items.map(d => ({ data: d })) },
      });
    })
  );
};

keystone
  .prepare({
    apps,
    dev: process.env.NODE_ENV !== 'production',
  })
  .then(async ({ middlewares }) => {
    await keystone.connect(process.env.MONGODB_URI);

    // Initialise some data.
    // NOTE: This is only for test purposes and should not be used in production
    const users = await keystone.lists.User.adapter.findAll();
    if (!users.length) {
      Object.values(keystone.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await initialiseLists(keystone, initialData);
      await initialiseLists(keystone, initialPosts);
    }

    const app = express();

    app.get('/reset-db', async (req, res) => {
      Object.values(keystone.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await initialiseLists(keystone, initialData);
      await initialiseLists(keystone, initialPosts);
      res.redirect('/admin');
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
