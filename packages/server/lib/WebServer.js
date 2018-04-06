const express = require('express');

module.exports = class Keystone {
  constructor(config) {
    this.config = config;
    this.app = express();

    const admin = config['admin ui'];
    if (admin) {
      const adminPath = '/admin';
      this.app.use(admin.createDevMiddleware({ adminPath }));
    }
  }
  start() {
    this.app.get('/', (req, res) => res.send('<h1>Hello Keystone</h1>'));
    this.app.listen(3000, () => console.log('KeystoneJS 5 ready on port 3000'));
  }
};
