const path = require('path');
const { executeDefaultServer, getEntryFileFullPath } = require('../utils');
const { DEFAULT_PORT, DEFAULT_ENTRY } = require('../../constants');

module.exports = {
  // prettier-ignore
  spec: {
    '--port':       Number,
    '-p':           '--port',
    '--entry':      String,
    '--app-url':    String,
    '--connect-to': String,
  },
  help: ({ exeName }) => `
    Usage
      $ ${exeName} dev --port=3000

    Options
      --port, -p    Port to start on [${DEFAULT_PORT}]
      --app-url     Custom application URL
      --entry       Entry file exporting keystone instance [${DEFAULT_ENTRY}]
  `,
  exec: async (args, { exeName, _cwd = process.cwd() } = {}, spinner) => {
    spinner.text = 'Validating project entry file';
    const entryFile = await getEntryFileFullPath(args, { exeName, _cwd });
    spinner.succeed(`Validated project entry file ./${path.relative(_cwd, entryFile)}`);
    spinner.start(' ');
    return executeDefaultServer(args, entryFile, undefined, spinner);
  },
};
