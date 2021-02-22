import { config } from '@keystone-next/keystone/schema';
import { statelessSessions, withItemData } from '@keystone-next/keystone/session';
import { lists } from './schema';
import { createAuth } from '@keystone-next/auth';
import 'dotenv/config';

const sessionSecret = process.env.COOKIE_SECRET || '-- DEV COOKIE SECRET; CHANGE ME --';
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

type DatabaseAdapterType = 'prisma_postgresql' | 'knex' | 'mongoose';
let databaseAdapter: DatabaseAdapterType = 'prisma_postgresql';
switch (process.env.DATABASE_ADAPTER || '') {
  case 'prisma_postgresql':
    databaseAdapter = 'prisma_postgresql';
    break;
  case 'knex':
    databaseAdapter = 'knex';
    break;
  case 'mongoose':
    databaseAdapter = 'mongoose';
    break;
}

export default withAuth(
  config({
    db: {
      adapter: databaseAdapter,
      url: process.env.DATABASE_URL || 'postgres://keystone5:k3yst0n3@localhost:5432/todo-example',
    },
    lists,
    server: {
      port: parseInt(process.env.PORT || '3000'),
    },
    ui: {
      isAccessAllowed: ({ session }) => !!session,
    },
    session: withItemData(statelessSessions(sessionConfig)),
  })
);
