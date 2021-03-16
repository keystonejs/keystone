import { config } from '@keystone-next/keystone/schema';
import { statelessSessions, withItemData } from '@keystone-next/keystone/session';
import { createAuth } from '@keystone-next/auth';

import { isSignedIn } from './access';
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
    itemData: {
      role: {
        create: {
          name: 'Admin Role',
          canManageUsers: true,
          canManageRoles: true,
          canCreatePosts: true,
          canUpdatePosts: true,
          canDeletePosts: true,
        },
      },
    },
  },
});

export default auth.withAuth(
  config({
    db: {
      adapter: 'prisma_postgresql',
      url: process.env.DATABASE_URL || 'postgres://dominik@localhost/tut2',
    },
    ui: {
      isAccessAllowed: isSignedIn,
    },
    lists,
    session: withItemData(
      statelessSessions({
        maxAge: sessionMaxAge,
        secret: sessionSecret,
      }),
      {
        User: `
        name
        role {
          canManageUsers
          canManageRoles
          canCreatePosts
          canUpdatePosts
          canDeletePosts
        }`,
      }
    ),
  })
);
