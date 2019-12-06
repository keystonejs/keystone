import meow from 'meow';
import init from './init';
import validate from './validate';
import build from './build';
import watch from './build/watch';
import fix from './fix';
import dev from './dev';
import { error, info } from './logger';
import { FatalError, FixableError } from './errors';

process.env.NODE_ENV = 'production';

let { input } = meow(
  `
Usage
  $ build-field-types [command]
Commands
  init         initialise a project
  build        build the package(s)
  watch        start a watch process to build the package(s)
  validate     validate the package(s)
  fix          infer as much information as possible and fix package(s)
`,
  {}
);

class CommandNotFoundError extends Error {}

(async () => {
  if (input.length === 1) {
    switch (input[0]) {
      case 'init': {
        await init(process.cwd());
        return;
      }
      case 'validate': {
        await validate(process.cwd());
        return;
      }
      case 'build': {
        await build(process.cwd());
        return;
      }
      case 'watch': {
        await watch(process.cwd());
        return;
      }
      case 'fix': {
        await fix(process.cwd());
        return;
      }
      case 'dev': {
        await dev(process.cwd());
        return;
      }
      default: {
        throw new CommandNotFoundError();
      }
    }
  } else {
    throw new CommandNotFoundError();
  }
})().catch(err => {
  if (err instanceof FixableError) {
    error(err.message, err.item);
    info('The above error can be fixed automatically by running build-field-types fix', err.item);
  } else if (err instanceof FatalError) {
    error(err.message, err.item);
  } else if (err instanceof CommandNotFoundError) {
    error('Command not found');
  } else {
    console.error(err);
  }
  process.exit(1);
});
