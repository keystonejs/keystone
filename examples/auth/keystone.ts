import { config } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import { createAuth } from '@keystone-6/auth';
import { lists } from './schema';

/**
 * TODO: Implement validateItem. Would be invoked by the getItem() method in
 * packages/auth/src/getExtendGraphQLSchema.ts
 */

const sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';
const sessionMaxAge = 60 * 60 * 24 * 30; // 30 days

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

  /* TODO -- review this later, it's not implemented yet and not fully designed (e.g error cases)
  // This ensures than an item is actually able to sign in
  validateItem: ({ item }) => item.isEnabled,
  */

  // initFirstItem turns on the "First User" experience, which prompts you to create a new user
  // when there are no items in the list
  initFirstItem: {
    // These fields are collected in the "Create First User" form
    fields: ['name', 'email', 'password'],
    // This is additional data that will always be set for the first item
    itemData: {
      // isAdmin is true, so the admin can pass isAccessAllowed (see below)
      isAdmin: true,
    },
  },

  // add isAdmin for the authed user (required by isAccessAllowed)
  sessionData: 'isAdmin',

  /* TODO -- complete the UI for these features and enable them
  passwordResetLink: {
    sendToken(args) {
      console.log(`Password reset info:`, args);
    },
  },
  magicAuthLink: {
    sendToken(args) {
      console.log(`Magic auth info:`, args);
    },
  },
  */
});

// withAuth applies the signin functionality to the keystone config
export default withAuth(
  config({
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./keystone-example.db',
    },
    lists,
    session:
      // Stateless sessions will store the listKey and itemId of the signed-in user in a cookie
      statelessSessions({
        // The maxAge option controls how long session cookies are valid for before they expire
        maxAge: sessionMaxAge,
        // The session secret is used to encrypt cookie data (should be an environment variable)
        secret: sessionSecret,
      }),
    ui: {
      // only admins can view the AdminUI
      isAccessAllowed: ({ session }) => {
        return session?.isAdmin
      }
    }
  })
);
