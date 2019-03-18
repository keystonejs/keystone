const endent = require('endent');
const pkgInfo = require('../package.json');
const info = {
  exeName: Object.keys(pkgInfo.bin)[0],
  version: pkgInfo.version,
};

const DEFAULT_COMMAND = 'dev';

module.exports = {
  DEFAULT_COMMAND,
  version: () => info.version,

  help: commands => endent`
    Usage
      $ ${info.exeName} <command>

    Available commands [default: ${DEFAULT_COMMAND}]
      ${Object.keys(commands).join(', ')}

    Common Options
      --version       Version number
      --help, -h      Displays this message

    Commands
      ${Object.entries(commands)
        .map(
          ([command, { help }]) => endent`
            ${command}
              ${endent(help(info))}
          `
        )
        .join('\n')}
  `,

  exec: (args, commands) => {
    const command = args._[0] ? args._[0] : DEFAULT_COMMAND;
    return commands[command].exec(args, info);
  },
};
