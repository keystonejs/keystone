const express = require('express');
const bodyParser = require('body-parser');

const { keystone, apps } = require('./index');
const { port } = require('./config');
const initRoutes = require('./routes');
const { logAdminRoutes } = require('./utils');

keystone
  .prepare({ apps, dev: process.env.NODE_ENV !== 'production' })
  .then(async ({ middlewares }) => {
    await keystone.connect();

    const app = express();
    app.use(middlewares);
    app.use(bodyParser.urlencoded({ extended: true }));
    app.set('views', './templates');
    app.set('view engine', 'pug');

    initRoutes(keystone, app);

    app.listen(port, error => {
      if (error) throw error;
      logAdminRoutes(apps, port);
    });
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
