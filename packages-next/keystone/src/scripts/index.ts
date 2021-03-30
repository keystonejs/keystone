import meow from 'meow';
import { dev } from './run/dev';
import { start } from './run/start';
import { build } from './build/build';
import { prisma } from './prisma';
import { postinstall } from './postinstall';

const commands = { dev, start, build, prisma, postinstall };

function cli() {
  const { input, help, flags } = meow(
    `
    Usage
      $ keystone-next [command]
    Commands
        dev           (default) start the project in development mode
        start         start the project in production mode
        build         build the project (must be done before using start)
        prisma        run the prisma CLI
        postinstall   
    `,
    {
      flags: {
        fix: { default: false, type: 'boolean' },
      },
    }
  );
  const command = input[0] || 'dev';
  if (!isCommand(command)) {
    console.log(`${command} is not a command that keystone-next accepts`);
    console.log(help);
    process.exit(1);
  }

  const cwd = process.cwd();

  if (command === 'prisma') {
    prisma(cwd, process.argv.slice(3));
  } else if (command === 'postinstall') {
    postinstall(cwd, flags.fix);
  } else {
    commands[command](cwd);
  }
}

function isCommand(command: string): command is keyof typeof commands {
  return command in commands;
}

cli();
