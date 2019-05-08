const keystone = require('@keystone-alpha/core');
const { executeDefaultServer, getEntryFileFullPath } = require('../utils');

module.exports = {
  // prettier-ignore
  spec: {
    '--port':   Number,
    '-p':       '--port',
    '--entry':  String,
    '--out':    String,
    '-o':       '--out',
  },
  help: ({ exeName }) => `
    Usage
      $ ${exeName} start --port=3000

    Options
      --port, -p  Port to start on [${keystone.DEFAULT_PORT}]
      --entry     Entry file exporting keystone instance [${keystone.DEFAULT_ENTRY}]
      --out, -o   Directory where build was saved [dist]
  `,
  exec: (args, { exeName, _cwd = process.cwd() } = {}) => {
    process.env.NODE_ENV = 'production';
    return getEntryFileFullPath(args, { exeName, _cwd }).then(entryFile =>
      executeDefaultServer(args, entryFile)
    );
  },
};
