const express = require('express');
const pathModule = require('path');
const cpy = require('cpy');

module.exports = class StaticServer {
  constructor({ route, path }) {
    this._route = route;
    this._path = path;
  }

  prepareMiddleware({ dev, distDir = '.' } = {}) {
    const app = express();
    let path = this._path;
    if (!dev) {
      path = pathModule.join(distDir, this._path);
    }
    app.use(this._route, express.static(pathModule.resolve(path)));
    return app;
  }

  build({ distDir }) {
    const source = pathModule.resolve(this._path);
    const destination = pathModule.resolve(pathModule.join(distDir, this._path));
    return cpy(source, destination);
  }
};
