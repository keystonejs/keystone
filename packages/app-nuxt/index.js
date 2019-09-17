const { Nuxt, Builder } = require('nuxt');
const express = require('express');

class NuxtApp {
  constructor({ ...config } = {}) {
    this._config = config;
  }

  async prepareMiddleware({ dev }) {
    const nuxt = new Nuxt({
      ...this._config,
      dev,
    });
    if (dev) {
      const builder = new Builder(nuxt);
      await builder.build();
    }
    const app = express.Router();
    return app.use(nuxt.render);
  }

  async build() {
    const nuxt = new Nuxt({ ...this._config, dev: false });
    return new Builder(nuxt).build();
  }
}

module.exports = { NuxtApp };
