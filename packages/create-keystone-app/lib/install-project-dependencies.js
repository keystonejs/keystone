const { exec, tick } = require('./util');
const { getArgs } = require('./get-args');

const installProjectDependencies = async () => {
  const args = getArgs();
  if (args['--dry-run']) {
    tick('Skipping install dependencies');
    return true;
  }

  console.log('Installing dependencies. This could take a few minutes.');
  const result = await exec('yarn install');

  if (result.failed) {
    const result = await exec('npm install');
    if (result.failed) {
      console.error(
        'Error installing dependencies. Try running yarn install in the project directory.'
      );
    }
  }
  return true;
};

module.exports = { installProjectDependencies };
