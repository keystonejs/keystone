const { exec, tick } = require('./util');
const { getArgs } = require('./get-args');

const installProjectDependencies = async () => {
  const args = getArgs();
  if (args['--dry-run']) {
    tick('Skipping install dependencies');
    return true;
  }

  console.log('Installing dependencies with yarn. This will take a few minutes.');
  // FIXME: Can we put a spinner in here to make it look like something is happening?
  const result = await exec('yarn');

  if (result.failed) {
    console.log('Failed to detect yarn. Installing dependencies with npm.');
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
