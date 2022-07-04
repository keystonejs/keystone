import { SessionStrategy } from '@keystone-6/core/src/types/session';
import { config } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import { createAuth } from '@keystone-6/auth';
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
    get: async ({ req, createContext }) => {
      // Get the session from the cookie stored by keystone
      const session = await get({ req, createContext });
      // If there is no session returned from keystone or there is no startTime on the session return an invalid session
      // If session.startTime is null session.data.passwordChangedAt > session.startTime will always be true and therefore
      // the session will never be invalid until the maxSessionAge is reached.
      if (!session || !session.startTime) return;
      // If the session data does not have a passwordChageAt property, add the current time to the database this will stop the user from getting into a loop of invalid sessions
      // Then return an invalid session - this could return a valid session but would be invalid for the next request anyway
      if (!session.data.passwordChangedAt) {
        const sudoContext = createContext({ sudo: true });
        await sudoContext.query[session.listKey].updateOne({
          where: { id: session.itemId },
          data: { passwordChangedAt: new Date() },
        });
        return;
      }
      if (session.data.passwordChangedAt > session.startTime) return;
      return session;
    },
    start: async ({ res, data, createContext }) => {
      // Add the current time to the session data
      const withTimeData = {
        ...data,
        startTime: new Date(),
      };
      // Start the keystone session and include the startTime
      return await start({ res, data: withTimeData, createContext });
    },
  };
};

const session = withTimeData(
  statelessSessions({
    // The session secret is used to encrypt cookie data (should be an environment variable)
    maxAge: maxSessionAge,
    secret: '-- EXAMPLE COOKIE SECRET; CHANGE ME --',
  })
);

// We wrap our config using the withAuth function. This will inject all
// the extra config required to add support for authentication in our system.
export default withAuth(
  config({
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./keystone-example.db',
    },
    lists,
    // We add our session configuration to the system here.
    session,
  })
);
