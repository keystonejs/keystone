import path from 'path';
import meow from 'meow';
import { dev } from './run/dev';
import { start } from './run/start';
import { build } from './build/build';

export type StaticPaths = { dotKeystonePath: string; projectAdminPath: string };

const commands = { dev, start, build };

function cli() {
  const { input, help } = meow(
    `
    Usage
      $ keystone-next [command]
    Commands
      Run
        dev           (default) start the project in development mode
        start         start the project in production mode
      Build
        build         build the project (must be done before using start)
      Migrate (Prisma only)
        reset         reset the database (this will drop all data!)
        generate      generate a migration
        deploy        deploy all migrations
    `,
    {
      flags: {
        allowEmpty: { default: false, type: 'boolean' },
        acceptDataLoss: { default: false, type: 'boolean' },
        name: { type: 'string' },
      },
    }
  );
  const command = input[0] || 'dev';
  if (!isCommand(command)) {
    console.log(`${command} is not a command that keystone-next accepts`);
    console.log(help);
    process.exit(1);
  }

  // These paths are non-configurable, as we need to use them
  // to find the config file (for `start`) itself!
  const dotKeystonePath = path.resolve('.keystone');
  const projectAdminPath = path.join(dotKeystonePath, 'admin');
  const staticPaths: StaticPaths = { dotKeystonePath, projectAdminPath };

  commands[command](staticPaths);
}

function isCommand(command: string): command is keyof typeof commands {
  return command in commands;
}

cli();
