const express = require('express');
const { createItems } = require('@keystonejs/server-side-graphql-client');

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
      await keystone.adapter.dropDatabase();
      await seedData(initialData);
    }

    const app = express();

    app.get('/reset-db', async (req, res) => {
      await keystone.adapter.dropDatabase();
      await seedData(initialData);
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

async function seedData(initialData) {
  return createItems({
    keystone,
    listKey: 'User',
    items: initialData.User.map(x => ({ data: x })),
  });
}
