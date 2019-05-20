const express = require('express');

const { keystone, apps } = require('./index');
const { port } = require('./config');
const initialData = require('./initialData');

keystone
  .prepare({ apps, port, dev: process.env.NODE_ENV !== 'production' })
  .then(async ({ middlewares }) => {
    await keystone.connect(process.env.MONGODB_URI);

    // Initialise some data.
    // NOTE: This is only for demo purposes and should not be used in production
    const users = await keystone.lists.User.adapter.findAll();
    if (!users.length) {
      await keystone.createItems(initialData);
    }

    const app = express();

    app.use(middlewares);

    app.listen(port, error => {
      if (error) throw error;
    });
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
