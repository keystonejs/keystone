const express = require('express');

const { keystone, apps } = require('./index');
const initialData = require('./data');

keystone
  .prepare({ apps, dev: process.env.NODE_ENV !== 'production' })
  .then(async ({ middlewares }) => {
    await keystone.connect();

    // Initialise some data.
    // NOTE: This is only for test purposes and should not be used in production
    const users = await keystone.lists.User.adapter.findAll();
    if (!users.length) {
      Object.values(keystone.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await Promise.all(
        Object.entries(initialData).map(([listName, items]) => {
          const list = keystone.lists[listName];
          return keystone.executeQuery({
            query: `mutation ($items: [${list.gqlNames.createManyInputName}]) { ${list.gqlNames.createManyMutationName}(data: $items) { id } }`,
            schemaName: 'admin',
            variables: { items: items.map(d => ({ data: d })) },
          });
        })
      );
    }

    const app = express();

    app.get('/reset-db', async (req, res) => {
      Object.values(keystone.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await Promise.all(
        Object.entries(initialData).map(([listName, items]) => {
          const list = keystone.lists[listName];
          return keystone.executeQuery({
            query: `mutation ($items: [${list.gqlNames.createManyInputName}]) { ${list.gqlNames.createManyMutationName}(data: $items) { id } }`,
            schemaName: 'admin',
            variables: { items: items.map(d => ({ data: d })) },
          });
        })
      );
      res.redirect('/admin');
    });

    app.use(middlewares);

    app.listen(process.env.PORT, error => {
      if (error) throw error;
    });
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
