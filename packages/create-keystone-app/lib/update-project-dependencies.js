const path = require('path');
const fs = require('fs');
const { exec } = require('./util');
const { getAdapterChoice } = require('./get-adapter-choice');
const { getArgs } = require('./get-args');
const { getProjectDirectory, tick } = require('./util');

const updateProjectDependencies = async () => {
  const args = getArgs();
  if (args['--dry-run']) {
    return true;
  }

  let failed = false;
  const { removeDependencies, dependencies } = await getAdapterChoice();

  // Remove dependencies if not also in the add dependencies list
  const yarnRemove =
    removeDependencies && removeDependencies.filter(dep => Boolean(!dependencies.includes(dep)));

  // Add dependencies if not already installed
  const newProjectDir = await getProjectDirectory();
  const packageJSON = JSON.parse(fs.readFileSync(path.join(newProjectDir, 'package.json')));
  const yarnAdd =
    dependencies &&
    dependencies.filter(dep => Boolean(!Object.keys(packageJSON.dependencies).includes(dep)));

  if (yarnRemove && yarnRemove.length) {
    const result = await exec(`yarn remove ${removeDependencies.join(' ')}`);
    if (result.failed) {
      const result = await exec(`npm uninstall ${removeDependencies.join(' ')}`);
      if (result.failed) {
        failed = true;
      }
    }
  }

  if (yarnAdd && yarnAdd.length) {
    const result = await exec(`yarn add ${dependencies.join(' ')}`);
    if (result.failed) {
      const result = await exec(`npm install ${dependencies.join(' ')}`);
      if (result.failed) {
        failed = true;
      }
    }
  }
  if (failed) {
    console.log('Error while installing dependencies.');
  } else {
    tick('Installed dependencies');
  }
};

module.exports = { updateProjectDependencies };
