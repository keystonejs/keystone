const { getExampleProject } = require('./get-example-project');
const fs = require('fs-extra');
const { getProjectDirectory, tick, error } = require('./util');
const { writeDirectoryFromGitHubToFs } = require('./github-api');
const { getArgs } = require('./get-args');

const createNewProjectFolder = newProjectFolder => {
  fs.mkdirpSync(newProjectFolder);
  const readDir = fs.readdirSync(newProjectFolder);
  if (readDir && readDir.length > 0) {
    error(`The project directory "./${newProjectFolder}" is not empty`);
    process.exit(1);
  }
};

const copyExampleProject = async () => {
  const args = getArgs();
  if (args['--dry-run']) {
    tick('Skipping writing project files');
    return;
  }

  const exampleProject = await getExampleProject();

  const to = await getProjectDirectory();

  createNewProjectFolder(to);

  await writeDirectoryFromGitHubToFs(
    `packages/create-keystone-app/example-projects/${exampleProject.folder}/`,
    to
  );
  tick('Writing project files');
};

module.exports = { copyExampleProject };
