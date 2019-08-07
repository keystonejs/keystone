const path = require('path');
const next = require('next');
const nextBuild = require('next/dist/build').default;

class NextApp {
  constructor({ dir }) {
    this._dir = path.resolve(dir);
  }

  async prepareMiddleware({ dev, distDir }) {
    const nextApp = next({ distDir, dir: this._dir, dev });
    await nextApp.prepare();
    return nextApp.getRequestHandler();
  }

  async build() {
    return nextBuild(this._dir);
  }
}

module.exports = {
  NextApp,
};
