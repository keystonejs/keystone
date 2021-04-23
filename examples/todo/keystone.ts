import { config } from '@keystone-next/keystone/schema';
import { statelessSessions, withItemData } from '@keystone-next/keystone/session';
import { createAuth } from '@keystone-next/auth';
import { lists } from './schema';

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
    db: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL || 'postgres://keystone5:k3yst0n3@localhost:5432/todo-example',
    },
    lists,
    ui: {
      isAccessAllowed: ({ session }) => !!session,
    },
    session: withItemData(statelessSessions(sessionConfig)),
  })
);
