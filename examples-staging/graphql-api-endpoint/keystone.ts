import { statelessSessions } from '@keystone-6/core/session';

import { config } from '@keystone-6/core';
import { createAuth } from '@keystone-6/auth';
import { lists } from './schema';

let sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The SESSION_SECRET environment variable must be set in production');
  } else {
    sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';
  }
}

let sessionMaxAge = 60 * 60 * 24 * 30; // 30 days

const auth = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
  },
  sessionData: 'name',
});

export default auth.withAuth(
  config({
    experimental: {
      /** Enables nextjs graphql api route mode */
      enableNextJsGraphqlApiEndpoint: true,
    },
    db: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL || 'postgres://username:password@localhost/database-name',
    },
    ui: {
      isAccessAllowed: context => !!context.session,
    },
    lists,
    session: statelessSessions({ maxAge: sessionMaxAge, secret: sessionSecret }),
  })
);
