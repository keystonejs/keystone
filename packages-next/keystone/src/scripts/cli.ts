import { dev } from './dev';

const commands = {
  dev,
  build,
  start,
};

export function cli(input: string[], helpText: string) {
  const command = input[0];

  if (!command) {
    console.log('You must pass a command to keystone-next');
    console.log(helpText);
    process.exit(1);
  }
  if (!(command in commands)) {
    console.log(`${command} is not a command that keystone-next accepts`);
    console.log(helpText);
    process.exit(1);
  }
  commands[command as keyof typeof commands]();
}
