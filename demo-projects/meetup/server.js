require('dotenv').config();

const keystone = require('@keystone-alpha/keystone');
const express = require('express');
const initialData = require('./initialData');

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/keystonejs-meetup';

keystone
  .prepare({ port, dev: process.env.NODE_ENV !== 'production' })
  .then(async ({ middlewares, keystone: keystoneApp }) => {
    await keystoneApp.connect(mongoUri);

    // Initialise some data.
    // NOTE: This is only for demo purposes and should not be used in production
    const users = await keystoneApp.lists.User.adapter.findAll();
    if (!users.length) {
      Object.values(keystoneApp.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
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
