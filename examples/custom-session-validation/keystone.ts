import { KeystoneConfig, SessionStrategy } from '@keystone-6/core/types';
import { config } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import { createAuth } from '@keystone-6/auth';
import { fixNextConfig, fixPrismaPath } from '../example-utils';
import { lists } from './schema';

// createAuth configures signin functionality based on the config below. Note this only implements
// authentication, i.e signing in as an item using identity and secret fields in a list. Session
// management and access control are controlled independently in the main keystone config.
const { withAuth } = createAuth({
  // This is the list that contains items people can sign in as
  listKey: 'Person',
  // The identity field is typically a username or email address
  identityField: 'email',
  // The secret field must be a password type field
  secretField: 'password',

  // initFirstItem turns on the "First User" experience, which prompts you to create a new user
  // when there are no items in the list yet
  initFirstItem: {
    // These fields are collected in the "Create First User" form
    fields: ['name', 'email', 'password'],
  },
  // Make passwordChangedAt available on the sesssion data
  sessionData: 'id passwordChangedAt',
});

const maxSessionAge = 60 * 60 * 8; // 8 hours, in seconds
// Stateless sessions will store the listKey and itemId of the signed-in user in a cookie.
// This session object will be made available on the context object used in hooks, access-control,
// resolvers, etc.

const withTimeData = (
  _sessionStrategy: SessionStrategy<Record<string, any>>
): SessionStrategy<Record<string, any>> => {
  const { get, start, ...sessionStrategy } = _sessionStrategy;
  return {
    ...sessionStrategy,
    get: async ({ context }) => {
      // Get the session from the cookie stored by keystone
      const session = await get({ context });
      // If there is no session returned from keystone or there is no startTime on the session return an invalid session
      // If session.startTime is null session.data.passwordChangedAt > session.startTime will always be true and therefore
      // the session will never be invalid until the maxSessionAge is reached.
      if (!session || !session.startTime) return;
      //if the password hasn't changed (and isn't missing), then the session is OK
      if (session.data.passwordChangedAt === null) return session;
      // If passwordChangeAt is undefined, then sessionData is missing the passwordChangedAt field
      // Or something is wrong with the session configuration so throw and error
      if (session.data.passwordChangedAt === undefined) {
        throw new TypeError('passwordChangedAt is not listed in sessionData');
      }
      if (session.data.passwordChangedAt > session.startTime) {
        return;
      }

      return session;
    },
    start: async ({ data, context }) => {
      // Add the current time to the session data
      const withTimeData = {
        ...data,
        startTime: new Date(),
      };
      // Start the keystone session and include the startTime
      return await start({ data: withTimeData, context });
    },
  };
};

const myAuth = (keystoneConfig: KeystoneConfig): KeystoneConfig => {
  // Add the session strategy to the config
  if (!keystoneConfig.session) throw new TypeError('Missing .session configuration');
  return {
    ...keystoneConfig,
    session: withTimeData(keystoneConfig.session),
  };
};

const session = statelessSessions({
  // The session secret is used to encrypt cookie data (should be an environment variable)
  maxAge: maxSessionAge,
  secret: '-- EXAMPLE COOKIE SECRET; CHANGE ME --',
});

// We wrap our config using the withAuth function. This will inject all
// the extra config required to add support for authentication in our system.
export default myAuth(
  withAuth(
    config({
      db: {
        provider: 'sqlite',
        url: process.env.DATABASE_URL || 'file:./keystone-example.db',

        // WARNING: this is only needed for our monorepo examples, dont do this
        ...fixPrismaPath,
      },
      ui: {
        // WARNING: this is only needed for our monorepo examples, dont do this
        ...fixNextConfig,
      },
      lists,
      // We add our session configuration to the system here.
      session,
    })
  )
);
