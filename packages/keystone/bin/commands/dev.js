const { executeDefaultServer, getEntryFileFullPath } = require('../utils');
const { DEFAULT_PORT, DEFAULT_ENTRY } = require('../../constants');

module.exports = {
  // prettier-ignore
  spec: {
    '--port':  Number,
    '-p':      '--port',
    '--entry': String,
  },
  help: ({ exeName }) => `
    Usage
      $ ${exeName} dev --port=3000

    Options
      --port, -p  Port to start on [${DEFAULT_PORT}]
      --entry     Entry file exporting keystone instance [${DEFAULT_ENTRY}]
  `,
  exec: (args, { exeName, _cwd = process.cwd() } = {}) => {
    return getEntryFileFullPath(args, { exeName, _cwd }).then(entryFile =>
      executeDefaultServer(args, entryFile)
    );
  },
};
