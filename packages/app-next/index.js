const path = require('path');
const next = require('next');
const nextBuild = require('next/dist/build').default;

class NextApp {
  constructor({ dir, keystone } = {}) {
    if (!dir || typeof dir !== 'string') {
      throw new Error('NextApp requires a "dir" option, which must be a string.');
    }
    this._dir = path.resolve(dir);
    this._keystone = keystone;
  }

  async prepareMiddleware({ dev, distDir }) {
    const nextApp = next({ distDir, dir: this._dir, dev });
    const handler = nextApp.getRequestHandler();
    await nextApp.prepare();
    return (req, res) => {
      req.keystone = this._keystone;
      return handler(req, res);
    };
  }

  async build() {
    return nextBuild(this._dir);
  }
}

module.exports = {
  NextApp,
};
