#!/usr/bin/env node

const arg = require('arg');
const chalk = require('chalk');
const { exec, createAppName, checkEmptyDir } = require('./generator');

const pkgInfo = require('../package.json');

const info = {
  exeName: Object.keys(pkgInfo.bin)[0],
  version: pkgInfo.version,
};

// Setup all the args
const argSpecDescription = [
  {
    description: 'Version number',
    command: '--help',
    alias: '-h',
    value: Boolean,
  },
  {
    description: 'Displays help',
    command: '--version',
    alias: '-v',
    value: Boolean,
  },
  {
    description: `No dependencies`,
    command: '--no-deps',
    alias: '-n',
    value: Boolean,
  },
];

// Translate args to arg format
const argSpec = {};
argSpecDescription.map(argument => {
  argSpec[argument.command] = argument.value;
  argSpec[argument.alias] = argument.command;
});

// Generate help from our arg specs
const help = args => {
  return `
╦╔═ ╔═╗ ╦ ╦ ╔═╗ ╔╦╗ ╔═╗ ╔╗╔ ╔═╗  ╦ ╔═╗
╠╩╗ ║╣  ╚╦╝ ╚═╗  ║  ║ ║ ║║║ ║╣   ║ ╚═╗
╩ ╩ ╚═╝  ╩  ╚═╝  ╩  ╚═╝ ╝╚╝ ╚═╝ ╚╝ ╚═╝

${chalk.bold('Usage')}
  ${chalk.gray('$')} ${info.exeName} ${chalk.gray('<project name>')}

${chalk.bold('Common Options')}
${args
    .map(
      argument =>
        `  ${`${argument.command}, ${argument.alias}`.padEnd(20, ' ')} ${argument.description}`
    )
    .join('\n')}\n
`;
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
    console.info(help(argSpecDescription));
    process.exit(0);
  }
}

if (args['--version']) {
  console.info(info.version);
  process.exit(0);
}

if (args['--help']) {
  console.info(help(argSpecDescription));
  process.exit(0);
}

const name = createAppName(args._.join(' '));

// if project name is missing print help
if (args._.length === 0 || name === '') {
  console.info(help(argSpecDescription));
  process.exit(0);
}

// check if folder exists and is not empty
try {
  checkEmptyDir(name);
} catch (error) {
  console.error(chalk.red(`\n${error}`));
  console.info(help(argSpecDescription));
  process.exit(0);
}

// Everything else is assumed to be a command we want to execute - more options added
exec(name, args['--no-deps'])
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .then(res => {
    console.log();
    console.log(chalk.green(`Your app "${res.name}" is ready in ${res.appName}/`));
    console.log(
      chalk.green(
        `You can start your app with ${chalk.yellow(`cd ${res.appName}`)} and ${chalk.yellow(
          `yarn start`
        )}`
      )
    );
    console.log();
    process.exit(0);
  });
