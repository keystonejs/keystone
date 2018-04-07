const express = require('express');

const initConfig = require('./initConfig');

module.exports = class Keystone {
  constructor(config) {
    this.config = initConfig(config);
    this.app = express();

    const admin = config['admin ui'];
    if (admin) {
      const adminPath = '/admin';
      this.app.use(admin.createDevMiddleware({ adminPath }));
    }
  }
  start() {
    const { port } = this.config;
    this.app.get('/', (req, res) => res.send('<h1>Hello Keystone</h1>'));
    this.app.listen(port, () =>
      console.log(`KeystoneJS 5 ready on port ${port}`)
    );
  }
};
