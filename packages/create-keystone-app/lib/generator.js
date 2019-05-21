#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const execa = require('execa');
const Listr = require('listr');
const ejs = require('ejs');
const split = require('split');
const { merge, throwError } = require('rxjs');
const { filter, catchError } = require('rxjs/operators');
const streamToObservable = require('@samverschueren/stream-to-observable');

const templateDir = path.join(__dirname, '..', 'templates');

/**
 * Cheks directory for empty, if not empty it throws error
 * @param {String} dir target directory to check for emptyness
 */
function checkEmptyDir(dir) {
  try {
    const readDir = fs.readdirSync(dir);
    if (readDir && readDir.length > 0) {
      throw new Error(`Project directory is not empty: ${path.basename(dir)}/`);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

// from https://github.com/sindresorhus/np/blob/master/source/index.js#L24
const exec = (cmd, args) => {
  const cp = execa(cmd, args);

  return merge(
    streamToObservable(cp.stdout.pipe(split())),
    streamToObservable(cp.stderr.pipe(split())),
    cp
  ).pipe(filter(Boolean));
};

/**
 * creates project
 * @param {String} name name of the project, input from user
 */
function generate(name, noDeps) {
  const appName = createAppName(name);
  const envVariables =
    process.platform === 'win32'
      ? 'SET NODE_ENV=development & SET DISABLE_LOGGING=true &'
      : 'NODE_ENV=development DISABLE_LOGGING=true';
  const projectDir = `.${path.sep}${path.relative(process.cwd(), appName)}`;
  let hasYarn = true;

  const tasks = new Listr([
    {
      title: `Check ${projectDir}`,
      task: () => {
        checkEmptyDir(projectDir);
        fs.mkdirSync(projectDir);
      },
    },
    {
      title: 'Create KeystoneJS Project',
      task: () =>
        copyTemplate(`${templateDir}/todo`, projectDir, {
          name,
          appName,
          envVariables,
        }),
    },
    {
      title: 'Install dependencies with Yarn',
      skip: () => noDeps && '--no-deps flag set',
      task: (ctx, task) =>
        exec('yarnpkg', { cwd: path.resolve(projectDir) }).pipe(
          catchError(error => {
            hasYarn = false;
            task.skip('Yarn not available, attempting with `npm`');
            return throwError(error);
          })
        ),
    },
    {
      title: 'Install dependencies with npm',
      enabled: () => !noDeps && hasYarn === false,
      task: () => exec('npm', ['install'], { cwd: path.resolve(projectDir) }),
    },
  ]);

  return tasks.run().then(() => ({ hasYarn, projectDir }));
}

/**
 * copies teplate ro project directory, renders .ejs file if needed
 * @param {String} templatePath path of the template for project
 * @param {String} projectDir project directory
 * @param {Object} templateData template data for ejs rendering
 */
function copyTemplate(templatePath, projectDir, templateData) {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach(file => {
    const origFilePath = `${templatePath}/${file}`;
    let writePath = `${projectDir}/${file}`;
    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (stats.isFile()) {
      let contents = fs.readFileSync(origFilePath, 'utf8');
      if (file.endsWith('.ejs')) {
        contents = ejs.render(contents, templateData);
        writePath = writePath.replace(/(\.ejs)$/, '');
      }

      fs.writeFileSync(writePath, contents, 'utf8');
    }
    // if file is directory, recursively copy template
    if (stats.isDirectory()) {
      fs.mkdirSync(`${projectDir}/${file}`);
      copyTemplate(origFilePath, `${projectDir}/${file}`, templateData);
    }
  });
}

/**
 * Create an app name from a directory path, fitting npm naming requirements.
 *
 * @param {String} pathName
 */

function createAppName(pathName) {
  return path
    .basename(pathName)
    .replace(/[^A-Za-z0-9.-]+/g, '-')
    .replace(/^[-_.]+|-+$/g, '')
    .toLowerCase();
}

module.exports = {
  exec: (name, noDeps = false) => {
    try {
      return Promise.resolve(generate(name, noDeps));
    } catch (error) {
      return Promise.reject(error);
    }
  },
  createAppName,
  checkEmptyDir,
};
