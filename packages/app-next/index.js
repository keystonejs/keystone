const next = require('next');
const nextBuild = require('next/dist/build').default;

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
    return nextBuild(this._dir);
  }
}

module.exports = {
  NextApp,
};
