const path = require('path');
const endent = require('endent');
const fs = require('fs-extra');
const keystone = require('@keystone-alpha/core');

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
      --out, -o   Directory to save build [dist]
  `,
  exec: async (args, { exeName, _cwd = process.cwd() } = {}) => {
    let serverFile = await getEntryFileFullPath(args, { exeName, _cwd });
    let { admin } = require(serverFile);
    if (admin) {
      let adminOutputPath = path.join(_cwd, 'dist', 'admin');
      await fs.remove(adminOutputPath);
      return admin.staticBuild({
        apiPath: '/admin/api',
        outputPath: adminOutputPath,
        graphiqlPath: '/admin/graphiql',
      });
    }

    // if (args['--out']) {
    //   console.log('--out', args['--out']);
    // }
  },
};
