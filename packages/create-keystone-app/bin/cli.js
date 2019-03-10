#!/usr/bin/env node

const arg = require('arg');

const generator = require('./generator');

// Setup all the args
const argSpec = {
  '--help': Boolean,
  '-h': '--help',
  '--version': Boolean,
};

// Parse the command line args coming in
const args = arg(argSpec, {
  // Capture the project name only
  permissive: false,
});

if (args['--version']) {
  console.log(generator.version());
  process.exit(0);
}

if (args['--help']) {
  console.log(generator.help());
  process.exit(0);
}

// if project name is missing print help
if (args._.length === 0) {
  console.log(generator.help());
  process.exit(0);
}

// Everything else is assumed to be a command we want to execute - more options added
generator.exec(args).catch(error => {
  console.error(error);
  process.exit(1);
});
