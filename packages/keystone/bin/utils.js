const keystone = require('@keystone-alpha/core');
const endent = require('endent');
const path = require('path');

function getCustomServerFullPath(args, { exeName, _cwd }) {
  const serverFile = args['--server'] ? args['--server'] : keystone.DEFAULT_SERVER;
  try {
    return Promise.resolve(require.resolve(path.resolve(_cwd, serverFile)));
  } catch (error) {
    if (args['--server']) {
      // A custom server was specified, but it wasn't found
      return Promise.reject(
        new Error(endent`
            --server=${serverFile} was passed to ${exeName}, but '${serverFile}' couldn't be found in ${process.cwd()}.
            Ensure you're running ${exeName} from within the root directory of the project.
          `)
      );
    }
    // No custom server
    return Promise.resolve();
  }
}

function warnInvalidCustomServerArgs(args, { exeName }) {
  if (args['--port']) {
    console.warn(endent`
        The ${exeName} --port CLI option does not work with a custom server.
        To set the port, pass it to keystone from within your custom server:
        > keystone.prepare({ port: 3000 })
      `);
  }

  if (args['--entry']) {
    console.warn(endent`
        The ${exeName} --entry CLI option does not work with a custom server.
        To set the entry file, pass it to keystone from within your custom server:
        > keystone.prepare({ entryFile: 'index.js' })
      `);
  }
}

function executeCustomServer(serverFileFullPath) {
  try {
    // Let the custom server handle setup
    require(serverFileFullPath);
    return Promise.resolve();
  } catch (error) {
    // Something went wrong when requiring their custom server (eg; syntax
    // error, etc). We make sure to expose the error here.
    return Promise.reject(error);
  }
}

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

function executeDefaultServer(args, entryFile) {
  const port = args['--port'] ? args['--port'] : keystone.DEFAULT_PORT;

  return keystone
    .prepare({ entryFile, port })
    .then(async ({ server, keystone: keystoneApp }) => {
      await keystoneApp.connect();

      return server.start();
    })
    .then(() => {
      console.log(`KeystoneJS ready on port ${port}`);
    });
}

module.exports = {
  getCustomServerFullPath,
  warnInvalidCustomServerArgs,
  getEntryFileFullPath,
  executeDefaultServer,
  executeCustomServer,
};
