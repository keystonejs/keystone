#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
var ejs = require('ejs');

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

/**
 * creates project
 * @param {String} name name of the project, input from user
 */
function generate(name) {
  const currentDir = process.cwd();
  const appName = createAppName(name);
  const projectDir = `${currentDir}/${appName}`;
  checkEmptyDir(projectDir);
  fs.mkdirSync(projectDir);
  copyTemplate(`${templateDir}/todo`, projectDir, {
    name,
    appName,
  });
  installDependencies(projectDir);
  return { name, appName };
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
 * installs dependency for the project
 * @param {String} projectDir project drectory
 */
function installDependencies(projectDir) {
  console.log(
    chalk.green(`\nCreated app in ${chalk.yellow(projectDir)}\nInstalling project dependencies now`)
  );
  const currentDir = process.cwd();
  process.chdir(projectDir);
  child_process.spawnSync('yarnpkg', {
    stdio: ['inherit', 'inherit', 'inherit'],
  });
  process.chdir(currentDir);
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
  exec: name => {
    try {
      return Promise.resolve(generate(name));
    } catch (error) {
      return Promise.reject(error);
    }
  },
  createAppName,
  checkEmptyDir,
};
