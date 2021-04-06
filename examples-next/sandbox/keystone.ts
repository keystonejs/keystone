// this is probably currently broken!
// that's expected right now, it'll be fixed at some point.
// we're currently essentially using CodeSandbox CI as a way to get
// published packages that we can try out in projects that aren't in the repo

import { config } from '@keystone-next/keystone/schema';
import { lists } from './schema';

export default config({
  db: process.env.DATABASE_URL?.startsWith('postgres')
    ? {
        adapter: 'prisma_postgresql',
        url: process.env.DATABASE_URL,
      }
    : {
        adapter: 'prisma_sqlite',
        url: process.env.DATABASE_URL || 'file:./dev.db',
      },
  lists,
});
