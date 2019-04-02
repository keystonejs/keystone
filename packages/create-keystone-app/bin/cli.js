#!/usr/bin/env node

const arg = require('arg');
const path = require('path');
const chalk = require('chalk');
const endent = require('endent');
const terminalLink = require('terminal-link');
const { exec, createAppName } = require('./generator');

const pkgInfo = require('../package.json');

const info = {
  exeName: Object.keys(pkgInfo.bin)[0],
  version: pkgInfo.version,
};

// Setup all the args
const argSpecDescription = [
  {
    description: 'Displays help',
    command: '--help',
    alias: '-h',
    value: Boolean,
  },
  {
    description: 'Version number',
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
argSpecDescription.forEach(argument => {
  argSpec[argument.command] = argument.value;
  argSpec[argument.alias] = argument.command;
});

const title = endent`
  ╦╔═ ╔═╗ ╦ ╦ ╔═╗ ╔╦╗ ╔═╗ ╔╗╔ ╔═╗  ╦ ╔═╗
  ╠╩╗ ║╣  ╚╦╝ ╚═╗  ║  ║ ║ ║║║ ║╣   ║ ╚═╗
  ╩ ╩ ╚═╝  ╩  ╚═╝  ╩  ╚═╝ ╝╚╝ ╚═╝ ╚╝ ╚═╝
`;

// Generate help from our arg specs
const help = args => {
  return endent`
    ${title}

    ${chalk.bold('Usage')}
      ${chalk.gray('$')} ${info.exeName} "${chalk.gray('<project name>')}"

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

const name = createAppName(args._[0] || '');

// if project name is missing print help
if (args._.length === 0 || name === '') {
  console.info(help(argSpecDescription));
  process.exit(0);
}

console.log(`${title}\n`);

// Everything else is assumed to be a command we want to execute - more options added
exec(name, args['--no-deps'])
  .catch(() => {
    process.exit(1);
  })
  .then(({ projectDir, hasYarn }) => {
    console.log();
    console.log(endent`
      🎉 KeystoneJS app created in ${chalk.bold(projectDir)}

      ${chalk.bold('Get started:')}

      ${chalk.yellow.bold(endent`
        cd ${projectDir}
        ${hasYarn ? 'yarn' : 'npm run'} start
      `)}

      ${chalk.bold('Next steps:')}

      - Edit ${chalk.bold(`${projectDir}${path.sep}index.js`)} to customize your app.
      - ${terminalLink('Open the Admin UI', 'http://localhost:3000/admin')}
      - ${terminalLink('Read the docs', 'https://v5.keystonejs.com')}
      - ${terminalLink('Star KeystoneJS on GitHub', 'https://github.com/keystonejs/keystone-5')}
    `);
    process.exit(0);
  });
