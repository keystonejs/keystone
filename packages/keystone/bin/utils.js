const keystone = require('@keystone-alpha/core');
const express = require('express');
const endent = require('endent');
const path = require('path');

function getEntryFileFullPath(args, { exeName, _cwd }) {
  const entryFile = args['--entry'] ? args['--entry'] : keystone.DEFAULT_ENTRY;
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
  const port = args['--port'] ? args['--port'] : keystone.DEFAULT_PORT;

  const app = express();

  return keystone
    .prepare({ entryFile, port, distDir, dev: process.env.NODE_ENV !== 'production' })
    .then(async ({ middlewares, keystone: keystoneApp }) => {
      await keystoneApp.connect();

      middlewares.forEach(middleware => app.use(middleware));

      return new Promise((resolve, reject) => {
        app.listen(port, error => (error ? reject(error) : resolve({ port })));
      });
    })
    .then(() => {
      console.log(`KeystoneJS ready on port ${port}`);
    });
}

module.exports = {
  getEntryFileFullPath,
  executeDefaultServer,
};
