const path = require('path');
const fs = require('fs-extra');
const keystone = require('@keystone-alpha/core');
const { getEntryFileFullPath } = require('../utils');

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
      --entry     Entry file exporting keystone instance [${keystone.DEFAULT_ENTRY}]
  `,
  exec: async (args, { exeName, _cwd = process.cwd() } = {}) => {
    process.env.NODE_ENV = 'production';
    let entryFile = await getEntryFileFullPath(args, { exeName, _cwd });
    let { admin, distDir = 'dist' } = require(entryFile);

    if (args['--out']) {
      distDir = args['--out'];
    }
    let resolvedDistDir = path.resolve(_cwd, distDir);
    await fs.remove(resolvedDistDir);

    if (admin) {
      console.log('Building Admin UI!');
      await admin.staticBuild({
        apiPath: '/admin/api',
        distDir: resolvedDistDir,
        graphiqlPath: '/admin/graphiql',
      });
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
