require('dotenv').config();

import { config } from '@keystone-next/keystone/schema';
import { statelessSessions, withItemData } from '@keystone-next/keystone/session';
import { createAuth } from '@keystone-next/auth';

import { lists } from './schema';

const sessionSecret = process.env.SESSION_SECRET || 'fallback_ss_0!FantasticFallBackSSSecret12345!';
const sessionMaxAge = 60 * 60 * 24 * 30; // 30 days

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
  },
});

const keystoneConfig = config({
  db: { provider: 'sqlite', url: 'file:./app.db' },
  experimental: {
    generateNextGraphqlAPI: true,
    generateNodeAPI: true,
  },
  ui: {
    isAccessAllowed: context => !!context.session?.data,
  },
  lists,
  session: withItemData(
    statelessSessions({
      maxAge: sessionMaxAge,
      secret: sessionSecret,
    }),
    { User: 'id name email' }
  ),
});

export default withAuth(keystoneConfig);
