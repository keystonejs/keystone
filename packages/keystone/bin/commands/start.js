const keystone = require('@keystone-alpha/core');
const {
  getCustomServerFullPath,
  warnInvalidCustomServerArgs,
  executeDefaultServer,
  executeCustomServer,
  getEntryFileFullPath,
} = require('../utils');

module.exports = {
  // prettier-ignore
  spec: {
    '--port':   Number,
    '-p':       '--port',
    '--entry':  String,
    '--server': String,
  },
  help: ({ exeName }) => `
    Usage
      $ ${exeName} start --port=3000

    Options
      --port, -p  Port to start on [${keystone.DEFAULT_PORT}]
      --entry     Entry file exporting keystone instance [${keystone.DEFAULT_ENTRY}]
      --server    Custom server file [${keystone.DEFAULT_SERVER}]
  `,
  exec: (args, { exeName, _cwd = process.cwd() } = {}) => {
    process.env.NODE_ENV = 'production';
    return getCustomServerFullPath(args, { exeName, _cwd }).then(serverFile => {
      if (serverFile) {
        warnInvalidCustomServerArgs(args, { exeName });
        return executeCustomServer(serverFile);
      }

      return getEntryFileFullPath(args, { exeName, _cwd }).then(entryFile =>
        executeDefaultServer(args, entryFile)
      );
    });
  },
};
