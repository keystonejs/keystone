// this is probably currently broken!
// that's expected right now, it'll be fixed at some point.
// we're currently essentially using CodeSandbox CI as a way to get
// published packages that we can try out in projects that aren't in the repo

import { config } from '@keystone-6/core';
import { lists } from './schema';

export default config({
  db: process.env.DATABASE_URL?.startsWith('postgres')
    ? {
        provider: 'postgresql',
        url: process.env.DATABASE_URL,
      }
    : {
        provider: 'sqlite',
        url: process.env.DATABASE_URL || 'file:./dev.db',
      },
  lists,
});
