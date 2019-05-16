const express = require('express');
const keystone = require('@keystone-alpha/keystone');

const { port } = require('./config');
const initialData = require('./initialData');

keystone
  .prepare({ port, dev: process.env.NODE_ENV !== 'production' })
  .then(async ({ middlewares, keystone: keystoneApp }) => {
    await keystoneApp.connect(process.env.MONGODB_URI);

    // Initialise some data.
    // NOTE: This is only for demo purposes and should not be used in production
    const users = await keystoneApp.lists.User.adapter.findAll();
    if (!users.length) {
      await keystoneApp.createItems(initialData);
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
