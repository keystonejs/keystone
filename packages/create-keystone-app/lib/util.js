const execa = require('execa');
const slugify = require('@sindresorhus/slugify');
const path = require('path');
const { getArgs } = require('./get-args');
const { getProjectName } = require('./get-project-name');
const c = require('kleur');

const tick = message => {
  var isWin = process.platform === 'win32';
  console.log((isWin ? c.green('√ ') : c.green('✔ ')) + c.bold(message));
};
const error = message => {
  console.log(c.red('Error: ') + c.bold(message));
};

const getProjectDirectory = async () => {
  const args = getArgs();
  const projectName = await getProjectName();
  return args['_'] && args['_'][0] ? args['_'][0] : slugify(projectName);
};

// execute a child process in the new project directory
const exec = async cmd => {
  const newProjectDir = await getProjectDirectory();
  let result = false;
  try {
    result = execa.commandSync(cmd, {
      cwd: path.resolve(newProjectDir),
    });
  } catch (error) {
    result = error;
  }
  return result;
};

module.exports = {
  exec,
  getProjectDirectory,
  tick,
  error,
};
