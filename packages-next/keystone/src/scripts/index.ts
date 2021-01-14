import meow from 'meow';
import { dev } from './dev';
import { build } from './build';
import { start } from './start';

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
  commands[command as keyof typeof commands]();
}

cli();
