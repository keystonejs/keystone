const path = require('path');
const fs = require('fs-extra');
const { getEntryFileFullPath } = require('../utils');
const { DEFAULT_ENTRY, DEFAULT_DIST_DIR } = require('../../constants');

module.exports = {
  // prettier-ignore
  spec: {
    '--out':   String,
    '-o':      '--out',
    '--entry': String,
  },
  help: ({ exeName }) => `
    Usage
      $ ${exeName} build --out=dist

    Options
      --out, -o   Directory to save build [dist]
      --entry     Entry file exporting keystone instance [${DEFAULT_ENTRY}]
  `,
  exec: async (args, { exeName, _cwd = process.cwd() } = {}) => {
    process.env.NODE_ENV = 'production';
    let entryFile = await getEntryFileFullPath(args, { exeName, _cwd });
    let { apps, distDir = DEFAULT_DIST_DIR } = require(entryFile);

    if (args['--out']) {
      distDir = args['--out'];
    }
    let resolvedDistDir = path.resolve(_cwd, distDir);
    await fs.remove(resolvedDistDir);

    if (apps) {
      await Promise.all(
        apps.map(app => {
          return app.build({
            apiPath: '/admin/api',
            distDir: resolvedDistDir,
            graphiqlPath: '/admin/graphiql',
          });
        })
      );

      console.log('Built Admin UI!');
    } else {
      console.log('Nothing to build.');
      console.log(
        `To create an Admin UI build, make sure you export 'admin' from ${path.relative(
          _cwd,
          entryFile
        )}`
      );
    }
  },
};
