const express = require('express');
const path = require('path');

const initConfig = require('./initConfig');

module.exports = class WebServer {
  constructor(keystone, config) {
    this.keystone = keystone;
    this.config = initConfig(config);
    this.app = express();

    const { adminUI, adminPath, cookieSecret } = this.config;
    if (adminUI) {
      this.app.use(adminUI.createDevMiddleware({ adminPath, cookieSecret }));
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
