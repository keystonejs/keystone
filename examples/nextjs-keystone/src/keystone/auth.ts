import { randomBytes } from 'crypto';
import { createAuth } from '@keystone-6/auth';

import { statelessSessions } from '@keystone-6/core/session';

// Don't forget to set this env variable in vercel
// or wherever you are deploying your Next.js app
let sessionSecret = process.env.SESSION_SECRET;
/*
  It is okay to use a random secret for development.
  But it's even better to use a stable secret via a .env file.
  BUT PLEASE REMEMBER TO ADD YOUR OWN SESSION SECRET
  FOR PRODUCTION BUILDS.
*/
if (!sessionSecret) {
  sessionSecret = randomBytes(32).toString('hex');
}

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  sessionData: 'id email name createdAt',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
  },
});

const sessionMaxAge = 60 * 60 * 24 * 30;

const session = statelessSessions({
  maxAge: sessionMaxAge,
  secret: sessionSecret!,
});

export { withAuth, session };
