import { config } from '@keystone-next/keystone/schema';
import { statelessSessions, withItemData } from '@keystone-next/keystone/session';
import { lists } from './schema';
import { createAuth } from '@keystone-next/auth';

const sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';
const sessionMaxAge = 60 * 60 * 24 * 30; // 30 days
const sessionConfig = {
  maxAge: sessionMaxAge,
  secret: sessionSecret,
};

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
  },
});

export default withAuth(
  config({
    db: process.env.DATABASE_URL?.startsWith('postgres')
      ? {
          adapter: 'prisma_postgresql',
          url: process.env.DATABASE_URL,
        }
      : {
          adapter: 'prisma_sqlite',
          url: process.env.DATABASE_URL || 'file:./dev.db',
        },
    experimental: { prismaSqlite: true },
    lists,
    ui: {
      isAccessAllowed: ({ session }) => !!session?.data,
    },
    session: withItemData(statelessSessions(sessionConfig)),
  })
);
