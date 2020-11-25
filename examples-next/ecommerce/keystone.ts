import 'dotenv/config';

import { config } from '@keystone-next/keystone/schema';
import { statelessSessions, withItemData } from '@keystone-next/keystone/session';
import { lists } from './schema';
import { extendGraphqlSchema } from './mutations';
import { createAuth } from '@keystone-next/auth';
import { insertSeedData } from './seed-data';
import { permissionsList } from './fields';

/*
  TODO
    - [ ] Configure send forgotten password
*/

const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost/keystone-examples-ecommerce';
const sessionConfig = {
  maxAge: 60 * 60 * 24 * 30, // 30 days
  secret: process.env.COOKIE_SECRET || '',
};

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    itemData: {
      role: {
        create: {
          name: 'Admin Role',
          ...Object.fromEntries(permissionsList.map(i => [i, true])),
        },
      },
    },
  },
});

// Dynamically query all the "can$" fields from the Role, and query them into the session. This is handy so we don't have to write each permission in several locations

export default withAuth(
  config({
    server: {
      cors: {
        origin: ['http://localhost:2223'],
        credentials: true
      }
    },
    db: {
      adapter: 'mongoose',
      url: databaseUrl,
      onConnect: async keystone => {
        if (process.argv.includes('--seed-data')) {
          insertSeedData(keystone);
        }
      },
    },
    lists,
    extendGraphqlSchema,
    ui: {
      isAccessAllowed: ({ session }) => !!session,
    },
    session: withItemData(statelessSessions(sessionConfig), {
      User: `id name role { ${permissionsList.join(' ')} }`,
    }),
  })
);
