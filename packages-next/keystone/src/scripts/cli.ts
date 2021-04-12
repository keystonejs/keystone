import meow from 'meow';
import { dev } from './run/dev';
import { start } from './run/start';
import { build } from './build/build';
import { prisma } from './prisma';
import { postinstall } from './postinstall';
import { ExitError } from './utils';

const commands = { dev, start, build, prisma, postinstall };

export async function cli(cwd: string, argv: string[]) {
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
        resetDb: { default: false, type: 'boolean' },
      },
      argv,
    }
  );
  const command = input[0] || 'dev';
  if (!isCommand(command)) {
    console.log(`${command} is not a command that keystone-next accepts`);
    console.log(help);
    throw new ExitError(1);
  }

  if (command === 'prisma') {
    await prisma(cwd, argv.slice(1));
  } else if (command === 'postinstall') {
    await postinstall(cwd, flags.fix);
  } else if (command === 'dev') {
    await dev(cwd, flags.resetDb);
  } else {
    await commands[command](cwd);
  }
}

function isCommand(command: string): command is keyof typeof commands {
  return command in commands;
}
