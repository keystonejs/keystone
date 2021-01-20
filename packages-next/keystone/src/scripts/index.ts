import path from 'path';
import meow from 'meow';
import { dev } from './dev';
import { build } from './build';
import { start } from './start';

export type StaticPaths = { dotKeystonePath: string; projectAdminPath: string };

function cli() {
  const commands = { dev, build, start };
  const { input, help } = meow(
    `
    Usage
      $ keystone-next [command]
    Commands
      dev          start the project in development mode
      build        build the project (must be done before using start)
      start        start the project in production mode
    `
  );
  const command = input[0] || 'dev';
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
