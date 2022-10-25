import meow from 'meow';
import { dev } from './run/dev';
import { start } from './run/start';
import { build } from './build/build';
import { prisma } from './prisma';
import { postinstall } from './postinstall';
import { telemetry } from './telemetry';
import { ExitError } from './utils';
import { migrate } from './migrate';

const commands = { dev, start, build, prisma, postinstall, telemetry, migrate };

export async function cli(cwd: string, argv: string[]) {
  const { input, help, flags } = meow(
    `
    Usage
      $ keystone [command]
    Commands
        dev           start the project in development mode (default)
        postinstall   generate client APIs and types (optional)
        build         build the project (must be done before using start)
        start         start the project in production mode
        migrate       setup and run database migrations
        prisma        run Prisma CLI commands safely
        telemetry     sets telemetry preference (enable/disable/status)
    `,
    {
      flags: {
        fix: { default: false, type: 'boolean' },
        resetDb: { default: false, type: 'boolean' },
        skipDbPush: { default: false, type: 'boolean' },
      },
      argv,
    }
  );
  const command = input[0] || 'dev';
  if (!isCommand(command)) {
    console.log(`${command} is not a command that keystone accepts`);
    console.log(help);
    throw new ExitError(1);
  }

  if (command === 'prisma') {
    return prisma(cwd, argv.slice(1));
  } else if (command === 'postinstall') {
    return postinstall(cwd, flags.fix);
  } else if (command === 'dev') {
    return dev(cwd, flags.resetDb, flags.skipDbPush);
  } else if (command === 'migrate') {
    return migrate(cwd, input, flags.resetDb);
  } else if (command === 'telemetry') {
    return telemetry(cwd, argv[1]);
  } else {
    return commands[command](cwd);
  }
}

function isCommand(command: string): command is keyof typeof commands {
  return command in commands;
}
