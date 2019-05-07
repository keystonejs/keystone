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
    if (admin) {
      let adminOutputPath = path.join(resolvedDistDir, 'admin');
      await fs.remove(adminOutputPath);
      console.log('Building Admin UI!');
      await admin.staticBuild({
        apiPath: '/admin/api',
        outputPath: adminOutputPath,
        graphiqlPath: '/admin/graphiql',
      });
      console.log('Built Admin UI!');
    }
  },
};
