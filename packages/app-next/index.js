const path = require('path');
const next = require('next');
const nextBuild = require('next/dist/build').default;

class NextApp {
  constructor({ dir } = {}) {
    if (!dir || typeof dir !== 'string') {
      throw new Error('NextApp requires a "dir" option, which must be a string.');
    }
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
