// @flow
import meow from 'meow';
import init from './init';
import validate from './validate';
import build from './build';
import watch from './build/watch';
import fix from './fix';
import { error, info } from './logger';
import { FatalError, FixableError } from './errors';

process.env.NODE_ENV = 'production';

let { input } = meow(
  `
Usage
  $ preconstruct [command]
Commands
  init         initialise preconstruct
  build        build the package(s)
  watch        start a watch process to build the package(s)
  validate     validate the package(s)
  fix          infer as much information as possible and fix package(s)
`,
  {}
);

let errors = {
  commandNotFound: 'Command not found',
};

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
    info('The above error can be fixed automatically by running preconstruct fix', err.item);
  } else if (err instanceof FatalError) {
    error(err.message, err.item);
  } else if (err instanceof CommandNotFoundError) {
    error(errors.commandNotFound);
  } else {
    console.error(err);
  }
  process.exit(1);
});
