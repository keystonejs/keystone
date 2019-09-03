const path = require('path');
const { Nuxt, Builder } = require('nuxt');
const express = require('express');
const nuxt = new Nuxt();

class NuxtApp {
  constructor({ dir }) {
    this._dir = path.resolve(dir);
  }

  async prepareMiddleware() {
    // const _app = express.Router();
    const app = express();
    return app.use(nuxt.render);
  }

  async build() {
    return new Builder(nuxt).build();
  }
}

module.exports = { NuxtApp };
