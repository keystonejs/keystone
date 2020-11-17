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
    - [x] Work out a good approach to seeding data
*/

const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost/keystone-examples-ecommerce';
const sessionConfig = {
  maxAge: 60 * 60 * 24 * 30, // 30 days
  secret: process.env.COOKIE_SECRET || '',
};

export default config({
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
    User: 'name permissions',
  }),
  plugins: [
    createAuth({
      listKey: 'User',
      identityField: 'email',
      secretField: 'password',
      initFirstItem: {
        fields: ['name', 'email', 'password'],
        itemData: {
          permissions: 'ADMIN',
        },
      },
    }).withAuth,
  ],
});
