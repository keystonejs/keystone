const { executeDefaultServer, getEntryFileFullPath } = require('../utils');
const { DEFAULT_PORT, DEFAULT_ENTRY } = require('../../constants');

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
      $ ${exeName} start <dist> --port=3000

    Options
      --port, -p  Port to start on [${DEFAULT_PORT}]
      --entry     Entry file exporting keystone instance [${DEFAULT_ENTRY}]
  `,
  exec: (args, { exeName, _cwd = process.cwd() } = {}) => {
    process.env.NODE_ENV = 'production';

    const distDir = args._[1];

    return getEntryFileFullPath(args, { exeName, _cwd }).then(entryFile =>
      executeDefaultServer(args, entryFile, distDir)
    );
  },
};
