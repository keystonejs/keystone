const path = require('path');
const endent = require('endent');
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
  exec: (args, { exeName, _cwd = process.cwd() } = {}) => {
    return getEntryFileFullPath(args, { exeName, _cwd }).then(serverFile => {
      let { admin } = require(serverFile);
      if (admin) {
        return admin.staticBuild({
          apiPath: '/admin/api',
          outputPath: path.join(_cwd, 'build', 'admin'),
          graphiqlPath: '/admin/graphiql',
        });
      }
    });
    // if (args['--out']) {
    //   console.log('--out', args['--out']);
    // }
  },
};
