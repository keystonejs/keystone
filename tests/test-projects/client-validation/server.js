const express = require('express');
const { createItems } = require('@keystonejs/server-side-graphql-client');

const { keystone, apps } = require('./index');
const { port } = require('./config');
const initialData = require('./data');

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
      await dropAllDatabases(keystone.adapters);
      await seedData(initialData);
    }

    const app = express();

    app.get('/reset-db', async (req, res) => {
      await dropAllDatabases(keystone.adapters);
      await seedData(initialData);
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

/**
 * @param {object} list of all the keystone adapters passed in while configuring the app.
 * @returns {Promise[]} array of Promises for dropping the keystone databases.
 */
function dropAllDatabases(adapters) {
  return Promise.all(Object.values(adapters).map(adapter => adapter.dropDatabase()));
}

async function seedData(initialData) {
  return createItems({
    keystone,
    listKey: 'User',
    items: initialData.User.map(x => ({ data: x })),
  });
}
