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
  // prettier-ignore
  spec: {
    '--port':   Number,
    '-p':       '--port',
    '--entry':  String,
  },
  help: ({ exeName }) => `
    Usage
      $ ${exeName} dev --port=3000

    Options
      --port, -p  Port to start on [${keystone.DEFAULT_PORT}]
      --entry     Entry file exporting keystone instance [${keystone.DEFAULT_ENTRY}]
  `,
  exec: (args, { exeName, _cwd = process.cwd() } = {}) => {
    return getEntryFileFullPath(args, { exeName, _cwd }).then(entryFile =>
      executeDefaultServer(args, entryFile)
    );
  },
};
