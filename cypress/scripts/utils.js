const fs = require('fs');
const tmp = require('tmp');
const dotEnv = require('dotenv');
const envfile = require('envfile');
const dotEnvSafe = require('dotenv-safe');
const memoize = require('fast-memoize');

// Always clean up tmp files even if the app explodes
tmp.setGracefulCleanup();

const PROJECTS_ROOT = `${__dirname}/../../projects`;

function loadEnvVars(directory, name) {
  const ciEnvPrefix = `PROJECT_${name
    .replace(/[^a-zA-Z]+/g, '')
    .toUpperCase()}_`;

  // Load the required env vars
  let required = dotEnv.parse(fs.readFileSync(`${directory}/.env.example`));

  // Inject the prefix onto the keys
  required = Object.keys(required).reduce(
    (memo, requiredKey) =>
      Object.assign(memo, {
        [`${ciEnvPrefix}${requiredKey}`]: required[requiredKey],
      }),
    {}
  );

  // write back to a temporary file
  const tmpobj = tmp.fileSync();
  fs.writeFileSync(tmpobj.fd, envfile.stringifySync(required));

  // Use that temporary file as the 'expected env' vars
  const envVars = dotEnvSafe.config({
    example: tmpobj.name,
  });

  if (envVars.error) {
    // TODO: Better error with info on how to set the correct env vars
    throw new Error(envVars.error);
  }

  // Return the env vars with the prefix removed
  return Object.keys(envVars.parsed)
    .filter(key => key.startsWith(ciEnvPrefix))
    .reduce(
      (memo, key) =>
        Object.assign(memo, {
          [key.replace(ciEnvPrefix, '')]: process.env[key],
        }),
      {}
    );
}

function objectToEnvString(envVars) {
  return Object.keys(envVars)
    .map(varName => `${varName}="${envVars[varName]}"`)
    .join(' ');
}

function getProjects() {
  const files = fs.readdirSync(PROJECTS_ROOT);
  return files
    .map(file => `${PROJECTS_ROOT}/${file}`)
    .filter(file => fs.statSync(file).isDirectory());
}

function getFolderName(dir) {
  const parts = dir.split('/');
  return parts[parts.length - 1];
}

function getProjectsInfo() {
  const paths = getProjects();
  return paths.reduce((memo, dir) => {
    const folderName = getFolderName(dir);
    const env = loadEnvVars(dir, folderName);
    memo[folderName] = {
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
