import { config } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import { createAuth } from '@keystone-6/auth';
import { fixNextConfig, fixPrismaPath } from '../example-utils';
import { lists } from './schema';

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

// WARNING: you need to change this
const sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';

// statelessSessions uses cookies for session tracking
//   these cookies have an expiry, in seconds
//   we use an expiry of 30 days for this example
const sessionMaxAge = 60 * 60 * 24 * 30;

// withAuth is a function we can use to wrap our base configuration
const { withAuth } = createAuth({
  // this is the list that contains items people can sign in as
  listKey: 'User',

  // an identity field is typically a username or email address
  identityField: 'email',

  // a secret field must be a password type field
  secretField: 'password',

  // initFirstItem enables the "First User" experience, this will add an interface form
  //   adding a new User item if the database is empty
  //
  // WARNING: do not use initFirstItem in production
  //   see https://keystonejs.com/docs/config/auth#init-first-item for more
  initFirstItem: {
    // the following fields are used by the "Create First User" form
    fields: ['name', 'email', 'password'],

    // the following fields are configured by default for this item
    itemData: {
      // isAdmin is true, so the admin can pass isAccessAllowed (see below)
      isAdmin: true,
    },
  },

  // add isAdmin to the session data(required by isAccessAllowed)
  sessionData: 'isAdmin',
});

// you can find out more at https://keystonejs.com/docs/apis/session#session-api
const session = statelessSessions({
  // an maxAge option controls how long session cookies are valid for before they expire
  maxAge: sessionMaxAge,
  // an session secret is used to encrypt cookie data (should be an environment variable)
  secret: sessionSecret,
});

export default withAuth(
  config({
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./keystone-example.db',

      // WARNING: this is only needed for our monorepo examples, dont do this
      ...fixPrismaPath,
    },
    lists,
    session,
    ui: {
      // only admins can view the AdminUI
      isAccessAllowed: ({ session }) => {
        return session?.data?.isAdmin;
      },
      // WARNING: this is only needed for our monorepo examples, dont do this
      ...fixNextConfig,
    },
  })
);
