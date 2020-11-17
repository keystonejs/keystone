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

export default config({
  db: {
    adapter: 'mongoose',
    url: 'mongodb://localhost/keystone-examples-todo',
  },
  lists,
  ui: {
    isAccessAllowed: ({ session }) => !!session,
  },
  session: withItemData(statelessSessions(sessionConfig)),
  plugins: [
    createAuth({
      listKey: 'User',
      identityField: 'email',
      secretField: 'password',
      initFirstItem: {
        fields: ['name', 'email', 'password'],
      },
    }).withAuth,
  ],
});
