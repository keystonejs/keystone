const next = require('next');
const build = require('next/dist/build');

class NextApp {
  constructor({ dir, nextRoutes }) {
    this._dir = dir;
    this._nextRoutes = nextRoutes;
  }

  async prepareMiddleware({ dev, distDir }) {
    const nextApp = next({ distDir, dir: this._dir, dev });
    await nextApp.prepare();
    // Add support for fridays/next-routes npm module
    if (this._nextRoutes) {
      return this._nextRoutes.getRequestHandler(nextApp);
    } else {
      return nextApp.getRequestHandler();
    }
  }

  async build() {
    return build(this._dir);
  }
}

module.exports = {
  NextApp,
};
