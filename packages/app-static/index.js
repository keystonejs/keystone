const fs = require('fs-extra');
const express = require('express');
const fallback = require('express-history-api-fallback');
const pathModule = require('path');

const getDistDir = (src, distDir) => {
  const srcRelative = pathModule.relative(process.cwd(), src);
  return pathModule.resolve(pathModule.join(distDir, srcRelative));
};

class StaticApp {
  constructor({ path, src, fallback }) {
    if (typeof path !== 'string') {
      throw new Error('StaticApp requires a "path" option, which must be a string.');
    }
    if (typeof src !== 'string') {
      throw new Error('StaticApp requires a "src" option, which must be a string.');
    }
    this._path = path;
    this._src = src;
    this._fallback = fallback;
  }

  prepareMiddleware({ dev, distDir }) {
    const app = express();
    const folderToServe = dev ? this._src : getDistDir(this._src, distDir);
    app.use(this._path, express.static(folderToServe));
    if (this._fallback) {
      app.use(fallback(this._fallback, { root: folderToServe }));
    }
    return app;
  }

  build({ distDir }) {
    const source = pathModule.resolve(this._src);
    const destination = getDistDir(this._src, distDir);
    return fs.copy(source, destination);
  }
}

module.exports = {
  StaticApp,
};
