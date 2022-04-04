import { config } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import { createAuth } from '@keystone-6/auth';

import { lists, extendGraphqlSchema } from './schema';

let sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';
let sessionMaxAge = 60 * 60 * 24 * 30; // 30 days

const auth = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    itemData: {
      isAdmin: true,
    },
  },
  sessionData: 'name isAdmin',
});

// TODO -- Create a separate example for access control in the Admin UI
// const isAccessAllowed = ({ session }: { session: any }) => !!session?.item?.isAdmin;

export default auth.withAuth(
  config({
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./keystone-example.db',
    },
    ui: {
      // NOTE -- this is not implemented, keystone currently always provides an admin ui at /
      // path: '/admin',
      // isAccessAllowed,
    },
    images: { upload: 'local' },
    files: { upload: 'local' },
    lists,
    extendGraphqlSchema,
    session: statelessSessions({ maxAge: sessionMaxAge, secret: sessionSecret }),
    // TODO -- Create a separate example for stored/redis sessions
    // session: storedSessions({
    //   store: new Map(),
    //   // store: redisSessionStore({ client: redis.createClient() }),
    //   secret: sessionSecret,
    // }),
  })
);
