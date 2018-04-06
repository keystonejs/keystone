const express = require('express');

module.exports = class Keystone {
  constructor(config) {
    this.config = config;
    this.app = express();
  }
  start() {
    this.app.listen(3000, () => console.log('KeystoneJS 5 ready on port 3000'));
  }
};
