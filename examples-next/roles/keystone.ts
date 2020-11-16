import { config } from '@keystone-next/keystone/schema';
import { statelessSessions, withItemData } from '@keystone-next/keystone/session';
import { lists } from './schema';
import { createAuth } from '@keystone-next/auth';

const sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';
const sessionMaxAge = 60 * 60 * 24 * 30; // 30 days
const sessionConfig = {
  maxAge: sessionMaxAge,
  secret: sessionSecret,
};

const { withAuth } = createAuth({
  listKey: 'Person',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    itemData: {
      role: {
        create: {
          name: 'Admin Role',
          canCreateTodos: true,
          canManageOwnTodos: true,
          canManageAllTodos: true,
          canSeeOtherUsers: true,
          canEditOtherUsers: true,
          canManageUsers: true,
          canManageRoles: true,
        },
      },
    },
  },
});

export default withAuth(
  config({
    db: {
      adapter: 'mongoose',
      url: 'mongodb://localhost/keystone-examples-roles',
    },
    lists,
    ui: {
      /* All users who are signed in are able to acces the Admin UI */
      isAccessAllowed: ({ session }) => !!session,
    },
    session: withItemData(statelessSessions(sessionConfig), {
      /* This loads the related role for the person, including all permissions */
      Person: `name role {
        canCreateTodos
        canManageOwnTodos
        canManageAllTodos
        canSeeOtherUsers
        canEditOtherUsers
        canManageUsers
        canManageRoles
      }`,
    }),
  })
);
