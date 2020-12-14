import meow from 'meow';
import { cli } from './cli';

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

cli(input, help);
