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
});
const sessionAge = 60 * 60 * 8; // 8 hours
// Stateless sessions will store the listKey and itemId of the signed-in user in a cookie.
// This session object will be made available on the context object used in hooks, access-control,
// resolvers, etc.

const withTimeData = (
  _sessionStrategy: SessionStrategy<Record<string, any>>
): SessionStrategy<{ startTime: string }> => {
  const { get, start, ...sessionStrategy } = _sessionStrategy;
  return {
    ...sessionStrategy,
    get: async ({ req, createContext }) => {
      const session = await get({ req, createContext });
      const sudoContext = createContext({ sudo: true });
      if (!session || !session.listKey || !session.startTime) {
        return;
      }
      const data = await sudoContext.query[session.listKey].findOne({
        where: { id: session.itemId },
        query: 'passwordChangedAt',
      });
      if (!data) return;
      if (data.passwordChangedAt > session.startTime) return;
      return { ...session, startTime: session.startTime };
    },
    start: async ({ res, data, createContext }) => {
      const withTimeData = {
        ...data,
        startTime: new Date(),
      };
      const newSession = await start({ res, data: withTimeData, createContext });
      return newSession;
    },
  };
};

const session = withTimeData(
  statelessSessions({
    // The session secret is used to encrypt cookie data (should be an environment variable)
    maxAge: sessionAge,
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
