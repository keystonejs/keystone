const fs = require('fs');
const dotEnvSafe = require('dotenv-safe');
const memoize = require('fast-memoize');

function loadEnvVars(directory) {
  const envVars = dotEnvSafe.config({
    path: `${directory}/.env`,
    example: `${directory}/.env.example`,
  });

  if (envVars.error) {
    throw new Error(envVars.error);
  }

  return envVars.parsed;
}

function objectToEnvString(envVars) {
  return Object.keys(envVars)
    .map(varName => `${varName}="${envVars[varName]}"`)
    .join(' ');
}

function getProjects() {
  const root = `${__dirname}/../../projects`;
  const files = fs.readdirSync(root);
  return files
    .map(file => `${root}/${file}`)
    .filter(file => fs.statSync(file).isDirectory());
}

function getFolderName(dir) {
  const parts = dir.split('/');
  return parts[parts.length - 1];
}

function getProjectsInfo() {
  const paths = getProjects();
  return paths.reduce((memo, dir) => {
    const env = loadEnvVars(dir);
    memo[getFolderName(dir)] = {
      dir,
      env,
      envString: objectToEnvString(env),
    };
    return memo;
  }, {});
}

module.exports = {
  getProjectsInfo: memoize(getProjectsInfo),
};
