#!/usr/bin/env node

const arg = require('arg');
const ora = require('ora');
const path = require('path');
const globby = require('globby');
const ciInfo = require('ci-info');
const devnull = require('dev-null');
const commandRunner = require('./command-runner');

const commandDir = path.join(__dirname, 'commands');

// Load the commands from the `commands` directory
const commands = globby
  .sync('*.js', {
    cwd: commandDir,
    onlyFiles: true,
  })
  .reduce(
    (memo, command) => ({
      ...memo,
      [command.split('.')[0]]: require(path.join(commandDir, command)),
    }),
    {}
  );

// Setup all the args
const argSpec = Object.values(commands).reduce(
  (memo, { spec }) => ({
    ...spec,
    ...memo,
  }),
  // prettier-ignore
  {
    '--help':    Boolean,
    '-h':        '--help',
    '--version': Boolean,
  }
);

// Parse the command line args coming in
const args = arg(argSpec, {
  // Capture the commands to run
  permissive: true,
});

if (args['--version']) {
  console.log(commandRunner.version());
  process.exit(0);
}

if (args['--help']) {
  console.log(commandRunner.help(commands));
  process.exit(0);
}

const spinner = ora({
  text: 'Initialising Keystone CLI',
  // Don't show any loading output on CI
  ...(ciInfo.isCI && { stream: devnull() }),
}).start();

// Everything else is assumed to be a command we want to execute
commandRunner.exec(args, commands, spinner).catch(error => {
  spinner.fail();
  console.error(error);
  process.exit(1);
});
