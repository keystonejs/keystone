const express = require('express');
const path = require('path');
const sessionMiddleware = require('express-session');

const initConfig = require('./initConfig');

module.exports = class WebServer {
  constructor(keystone, config) {
    this.keystone = keystone;
    this.config = initConfig(config);
    this.express = express;
    this.app = express();

    const { adminUI, adminPath, cookieSecret, session } = this.config;

    if (adminUI) {
      this.app.use(adminUI.createDevMiddleware({ adminPath, cookieSecret }));
    }

    // TODO: think more about how this should be configured and defaulted
    // including how the project can configure a session store
    if (session) {
      this.app.use(
        sessionMiddleware({
          secret: cookieSecret,
          resave: false,
          saveUninitialized: false,
          name: 'keystone.sid',
        })
      );
    }
  }
  start() {
    const { app, config: { port } } = this;
    app.get('/', (req, res) =>
      res.sendFile(path.resolve(__dirname, './default.html'))
    );
    app.listen(port, () => {
      console.log(`KeystoneJS 5 ready on port ${port}`);
    });
  }
};
