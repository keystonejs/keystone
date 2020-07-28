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
      const context = keystone.createContext({ schemaName: 'internal' });
      for (const [listKey, items] of Object.entries(initialData)) {
        await createItems({ keystone, listKey, items: items.map(x => ({ data: x })), context });
      }
    }

    const app = express();

    app.get('/reset-db', async (req, res) => {
      await Promise.all(Object.values(keystone.adapters).map(adapter => adapter.dropDatabase()));
      const context = keystone.createContext({ schemaName: 'internal' });
      for (const [listKey, items] of Object.entries(initialData)) {
        await createItems({ keystone, listKey, items: items.map(x => ({ data: x })), context });
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
