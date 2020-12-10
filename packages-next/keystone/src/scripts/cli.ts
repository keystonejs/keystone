import { dev } from './dev';
import { build } from './build';
import { start } from './start';

const commands = {
  dev,
  build,
  start,
};

export function cli(input: string[], helpText: string) {
  const command = input[0] || 'dev';

  if (!(command in commands)) {
    console.log(`${command} is not a command that keystone-next accepts`);
    console.log(helpText);
    process.exit(1);
  }
  commands[command as keyof typeof commands]();
}
