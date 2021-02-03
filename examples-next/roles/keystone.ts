import { config } from '@keystone-next/keystone/schema';
import { statelessSessions, withItemData } from '@keystone-next/keystone/session';
import { lists } from './schema';
import { createAuth } from '@keystone-next/auth';

import { isSignedIn } from './access';

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
      /*
        This creates a related role with full permissions, so that when the first user signs in
        they have complete access to the system (without this, you couldn't do anything)
      */
      role: {
        create: {
          name: 'Admin Role',
          canCreateTodos: true,
          canManageAllTodos: true,
          canSeeOtherPeople: true,
          canEditOtherPeople: true,
          canManagePeople: true,
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
      /* Everyone who is signed in can access the Admin UI */
      isAccessAllowed: isSignedIn,
    },
    session: withItemData(statelessSessions(sessionConfig), {
      /* This loads the related role for the current user, including all permissions */
      Person: `name role {
        id
        name
        canCreateTodos
        canManageAllTodos
        canSeeOtherPeople
        canEditOtherPeople
        canManagePeople
        canManageRoles
      }`,
    }),
  })
);
