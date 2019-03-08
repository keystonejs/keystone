const path = require('path');
const keystone = require('@keystone-alpha/core');

const { getEntryFileFullPath } = require('../util');

module.exports = {
  // prettier-ignore
  spec: {
    '--out': String,
    '-o':    '--out',
  },
  help: ({ exeName }) => `
    Usage
      $ ${exeName} build --out=dist

    Options
      --out, -o   Directory to save build [${keystone.DEFAULT_DIST_DIR}]
  `,
  exec: (args, { exeName, _cwd = process.cwd() } = {}) => {
    const outDir = args['--out'] ? args['--out'] : keystone.DEFAULT_DIST_DIR;

    return getEntryFileFullPath(args, { exeName, _cwd }).then(entryFile => {
      const { appEntry, cleanedServerConfig } = keystone.prepareConfig({ entryFile, _cwd });
      if (appEntry.admin) {
        return appEntry.admin
          .createBuild({
            apiPath: cleanedServerConfig.apiPath,
            graphiqlPath: cleanedServerConfig.graphiqlPath,
            authStrategy: cleanedServerConfig.authStrategy,
            outDir,
            analyze: process.env.ANALYZE_DIR,
          })
          .then(() => {
            console.log(`KeystoneJS Admin UI built and saved to ./${path.relative(_cwd, outDir)}`);
          });
      }
      console.log(
        `Nothing to build. Did you forget to export '.admin' from ./${path.relative(
          _cwd,
          entryFile
        )}?`
      );
    });
  },
};
