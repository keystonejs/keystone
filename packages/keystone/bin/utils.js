const keystone = require('@keystone-alpha/core');
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

  return keystone
    .prepare({ entryFile, port, distDir })
    .then(async ({ server, keystone: keystoneApp }) => {
      await keystoneApp.connect();

      return server.start();
    })
    .then(() => {
      console.log(`KeystoneJS ready on port ${port}`);
    });
}

module.exports = {
  getEntryFileFullPath,
  executeDefaultServer,
};
