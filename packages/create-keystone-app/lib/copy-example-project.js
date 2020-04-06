const { getExampleProject } = require('./get-example-project');
const path = require('path');
const fs = require('fs-extra');
const { getProjectDirectory, tick, error } = require('./util');
const { getArgs } = require('./get-args');

const createNewProjectFolder = newProjectFolder => {
  fs.mkdirpSync(newProjectFolder);
  const readDir = fs.readdirSync(newProjectFolder);
  if (readDir && readDir.length > 0) {
    error(`The project directory ${newProjectFolder} is not empty`);
    process.exit(0);
  }
};

const copyExampleProject = async () => {
  const args = getArgs();
  if (args['--dry-run']) {
    tick('Skipping copy project files');
    return true;
  }

  const exampleProject = await getExampleProject();

  const from = path.join(__dirname, '..', 'example-projects', exampleProject.folder);

  const to = await getProjectDirectory();

  createNewProjectFolder(to);
  fs.copySync(from, to);
  tick('Copying project files');
};

module.exports = { copyExampleProject };
