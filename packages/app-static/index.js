const express = require('express');
const pathModule = require('path');
const cpy = require('cpy');

module.exports = class StaticServer {
  constructor({ path, src }) {
    this._path = path;
    this._src = src;
  }

  prepareMiddleware({ dev, distDir = '.' } = {}) {
    const app = express();
    let src = this._src;
    if (!dev) {
      src = pathModule.join(distDir, this._src);
    }
    app.use(this._path, express.static(pathModule.resolve(src)));
    return app;
  }

  build({ distDir }) {
    const source = pathModule.resolve(this._src);
    const destination = pathModule.resolve(pathModule.join(distDir, this._src));
    return cpy(source, destination);
  }
};
