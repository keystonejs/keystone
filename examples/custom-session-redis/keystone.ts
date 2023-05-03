import { config } from '@keystone-6/core';
import { storedSessions } from '@keystone-6/core/session';
import { createAuth } from '@keystone-6/auth';
import { createClient } from '@redis/client';
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
});

const redis = createClient();

const session = storedSessions({
  store: ({ maxAge }) => ({
    async get(key) {
      let result = await redis.get(key);
      if (typeof result === 'string') {
        return JSON.parse(result);
      }
    },
    async set(key, value) {
      await redis.setEx(key, maxAge, JSON.stringify(value));
    },
    async delete(key) {
      await redis.del(key);
    },
  }),
  // The session secret is used to encrypt cookie data (should be an environment variable)
  secret: '-- EXAMPLE COOKIE SECRET; CHANGE ME --',
});

// We wrap our config using the withAuth function. This will inject all
// the extra config required to add support for authentication in our system.
export default withAuth(
  config({
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./keystone-example.db',
      async onConnect() {
        await redis.connect();
      },

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
);
