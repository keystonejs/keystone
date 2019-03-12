#!/usr/bin/env node

const arg = require('arg');
const chalk = require('chalk');
const generator = require('./generator');

// Setup all the args
const argSpec = {
  '--help': Boolean,
  '-h': '--help',
  '--version': Boolean,
  '-V': '--version',
};

let args;
try {
  // Parse the command line args coming in
  args = arg(argSpec, {
    // Capture the project name only
    permissive: false,
  });
} catch (error) {
  if (error.code === 'ARG_UNKNOWN_OPTION') {
    console.error(chalk.red(`\nError: ${error.message}`));
    console.info(generator.help());
    process.exit(0);
  }
}

if (args['--version']) {
  console.info(generator.version());
  process.exit(0);
}

if (args['--help']) {
  console.info(generator.help());
  process.exit(0);
}

// if project name is missing print help
if (args._.length === 0) {
  console.info(generator.help());
  process.exit(0);
}

// check if folder exists and is not empty
const name = generator.createAppName(args._.join(' '));
try {
  generator.checkEmptyDir(name);
} catch (error) {
  console.error(chalk.red(`\n${error}`));
  console.info(generator.help());
  process.exit(0);
}

// Everything else is assumed to be a command we want to execute - more options added
generator.exec(name).catch(error => {
  console.error(error);
  process.exit(1);
});
