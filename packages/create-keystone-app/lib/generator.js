#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const execa = require('execa');
const Listr = require('listr');
const ejs = require('ejs');
const split = require('split');
const { merge, throwError } = require('rxjs');
const { filter, catchError } = require('rxjs/operators');
const streamToObservable = require('@samverschueren/stream-to-observable');

const templateBase = path.join(__dirname, '..', 'templates');

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
async function generate({ name, appName, noDeps, projectDir, template }) {
  checkEmptyDir(projectDir);
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir);
  }

  let hasYarn = true;
  const tasks = new Listr([
    {
      title: 'Create KeystoneJS Project',
      task: () =>
        copyTemplate(`${templateBase}/${template}`, projectDir, {
          name,
          appName,
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
 * copies template ro project directory, renders .ejs file if needed
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
      const dir = `${projectDir}/${file}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      copyTemplate(origFilePath, dir, templateData);
    }
  });
}

/**
 * Create an app name from a directory path, fitting npm naming requirements.
 *
 * @param {String} pathName
 */

function createAppName(pathName) {
  if (pathName === '.') {
    pathName = process.cwd();
  }

  return path
    .basename(pathName)
    .replace(/[^A-Za-z0-9.-]+/g, '-')
    .replace(/^[-_.]+|-+$/g, '')
    .toLowerCase();
}

module.exports = {
  exec: args => {
    try {
      return Promise.resolve(generate(args));
    } catch (error) {
      return Promise.reject(error);
    }
  },
  createAppName,
  checkEmptyDir,
};
