const fs = require('fs-extra');
const express = require('express');
const pathModule = require('path');

const getDistDir = (src, distDir) => {
  const srcRelative = pathModule.relative(process.cwd(), src);
  return pathModule.resolve(pathModule.join(distDir, srcRelative));
};

class StaticApp {
  constructor({ path, src }) {
    this._path = path;
    this._src = src;
  }

  prepareMiddleware({ dev, distDir }) {
    const app = express();
    const folderToServe = dev ? this._src : getDistDir(this._src, distDir);
    app.use(this._path, express.static(folderToServe));
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
