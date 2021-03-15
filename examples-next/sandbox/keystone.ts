import { config } from '@keystone-next/keystone/schema';
import { statelessSessions, withItemData } from '@keystone-next/keystone/session';
import { lists } from './schema';

const sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';
const sessionMaxAge = 60 * 60 * 24 * 30; // 30 days
const sessionConfig = {
  maxAge: sessionMaxAge,
  secret: sessionSecret,
};

export default config({
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
  session: withItemData(statelessSessions(sessionConfig)),
});
