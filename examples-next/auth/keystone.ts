import { config } from '@keystone-spike/keystone/schema';
import { statelessSessions, withItemData } from '@keystone-spike/keystone/session';
import { lists } from './schema';
import { createAuth } from '@keystone-spike/auth';

/**
 * TODO: Implement validateItem. Would be invoked by the getItem() method in
 * packages-next/auth/src/getExtendGraphQLSchema.ts
 */

// createAuth configures signin functionality based on the config below. Note this only implements
// authentication, i.e signing in as an item using identity and secret fields in a list. Session
// management and access control are controlled independently in the main keystone config.
const { withAuth } = createAuth({
  // This is the list that contains items people can sign in as
  listKey: 'User',
  // The identity field is typically a username or email address
  identityField: 'email',
  // The secret field must be a password type field
  secretField: 'password',
  /* TODO -- review this later
  // This ensures than an item is actually able to sign in
  validateItem: ({ item }) => item.isEnabled,
  */
  // initFirstItem turns on the "First User" experience, which prompts you to create a new user
  // when there are no items in the list yet
  initFirstItem: {
    // These fields are collected in the "Create First User" form
    fields: ['name', 'email', 'password'],
    // This is additional data that will be set when creating the first item
    itemData: {
      // We need to specify that isAdmin is true for the first item, so the user can access the
      // Admin UI (see isAccessAllowed in the admin config below)
      isAdmin: true,
      // Only enabled users can sign in, so we need to set this as well
      isEnabled: true,
    },
  },
});

// withAuth applies the signin functionality to the keystone config
export default withAuth(
  config({
    name: 'KeystoneJS Auth Example',
    db: {
      adapter: 'mongoose',
      url: 'mongodb://localhost/keystone-examples-next-auth',
    },
    admin: {
      // Only allow users with the isAdmin checkbox set to access the Admin UI
      isAccessAllowed: ({ session }: { session: any }) => !!session?.item?.isAdmin,
    },
    lists,
    session: withItemData(
      // Stateless sessions will store the listKey and itemId of the signed-in user in a cookie
      statelessSessions({
        // The session secret is used to encrypt cookie data (should be an environment variable)
        secret: 'super secret session key',
      }),
      // withItemData will fetch these fields for signed-in User items to populate session.data
      { User: 'name isAdmin' }
    ),
  })
);
