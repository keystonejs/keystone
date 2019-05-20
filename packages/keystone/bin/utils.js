const express = require('express');
const endent = require('endent');
const path = require('path');

const { DEFAULT_CONNECT_TO, DEFAULT_ENTRY, DEFAULT_PORT } = require('../constants');

function getEntryFileFullPath(args, { exeName, _cwd }) {
  const entryFile = args['--entry'] ? args['--entry'] : DEFAULT_ENTRY;
  try {
    return Promise.resolve(require.resolve(path.resolve(_cwd, entryFile)));
  } catch (error) {
    return Promise.reject(
      new Error(endent`
        --entry=${entryFile} was passed to ${exeName}, but '${entryFile}' couldn't be found in ${process.cwd()}.
        Ensure you're running ${exeName} from within the root directory of the project.
      `)
    );
  }
}

function executeDefaultServer(args, entryFile, distDir) {
  const port = args['--port'] ? args['--port'] : DEFAULT_PORT;
  const connectTo = args['--connect-to'] ? args['--connect-to'] : DEFAULT_CONNECT_TO;

  const { keystone, apps } = require(path.resolve(entryFile));

  const app = express();

  return keystone
    .prepare({ apps, port, distDir, dev: process.env.NODE_ENV !== 'production' })
    .then(async ({ middlewares }) => {
      await keystone.connect(connectTo);

      app.use(middlewares);

      return new Promise((resolve, reject) => {
        const server = app.listen(port, error => {
          if (error) {
            return reject(error);
          }
          console.log(`KeystoneJS ready on port ${port}`);
          return resolve({ port, server });
        });
      });
    });
}

module.exports = {
  getEntryFileFullPath,
  executeDefaultServer,
};
