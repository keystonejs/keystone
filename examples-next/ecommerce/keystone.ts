import 'dotenv/config';

import { config } from '@keystone-next/keystone/schema';
import { statelessSessions, withItemData } from '@keystone-next/keystone/session';
import { lists, extendGraphqlSchema } from './schema';
import { createAuth } from '@keystone-next/auth';
import { insertSeedData } from './seed-data';
import { permissionsList } from './roleFields';

/*
  TODO
    - [ ] Configure send forgotten password
    - [x] Work out a good approach to seeding data
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
      permissions: 'ADMIN',
    },
  },
});

// Dynamically query all the "can$" fields from the Role, and query them into the session. This is handy so we don't have to write each permission in several locations

export default withAuth(
  config({
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


