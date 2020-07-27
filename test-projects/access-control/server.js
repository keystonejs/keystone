const express = require('express');

const { keystone, apps } = require('./index');
const { port } = require('./config');
const initialData = require('./data');
const { createItems } = require('@keystonejs/server-side-graphql-client');

keystone
  .prepare({
    apps,
    dev: process.env.NODE_ENV !== 'production',
  })
  .then(async ({ middlewares }) => {
    await keystone.connect();

    // Initialise some data.
    // NOTE: This is only for test purposes and should not be used in production
    const users = await keystone.lists.User.adapter.findAll();
    if (!users.length) {
      await Promise.all(Object.values(keystone.adapters).map(adapter => adapter.dropDatabase()));
      for (const [listName, items] of Object.entries(initialData)) {
        await createItems({
          keystone,
          listName,
          items: items.map(x => ({ data: x })),
          schemaName: 'internal',
        });
      }
    }

    const app = express();

    app.get('/reset-db', async (req, res) => {
      Object.values(keystone.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });

      for (const [listName, items] of Object.entries(initialData)) {
        await createItems({
          keystone,
          listName,
          items: items.map(x => ({ data: x })),
          schemaName: 'internal',
        });
      }
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
