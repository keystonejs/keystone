import path from 'path';
import meow from 'meow';
import { prototype } from './run/prototype';
import { dev } from './run/dev';
import { start } from './run/start';
import { build } from './build/build';
import { deploy } from './migrate/deploy';
import { generate } from './migrate/generate';

export type StaticPaths = { dotKeystonePath: string; projectAdminPath: string };

function cli() {
  const commands = { prototype, dev, start, build, deploy, generate };
  const { input, help } = meow(
    `
    Usage
      $ keystone-next [command]
    Commands
      Run
        prototype     start the project in prototyping mode
        dev           start the project in development mode
        start         start the project in production mode
      Build
        build         build the project (must be done before using start)
      Migrate
        reset         reset the database (this will drop all data!)
        generate      generate a migration
        deploy        deploy all migrations
    `
  );
  const command = input[0] || 'prototype';
  if (!(command in commands)) {
    console.log(`${command} is not a command that keystone-next accepts`);
    console.log(help);
    process.exit(1);
  }

  // These paths are non-configurable, as we need to use them
  // to find the config file (for `start`) itself!
  const dotKeystonePath = path.resolve('.keystone');
  const projectAdminPath = path.join(dotKeystonePath, 'admin');
  const staticPaths: StaticPaths = { dotKeystonePath, projectAdminPath };

  commands[command as keyof typeof commands](staticPaths);
}

cli();
