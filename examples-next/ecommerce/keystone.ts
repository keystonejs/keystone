import 'dotenv/config';

import { config } from '@keystone-next/keystone/schema';
import { statelessSessions, withItemData } from '@keystone-next/keystone/session';
import { lists } from './schema';
import { extendGraphqlSchema } from './mutations';
import { createAuth } from '@keystone-next/auth';
import { insertSeedData } from './seed-data';
import { permissionsList } from './fields';

const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost/keystone-examples-ecommerce';
const protectIdentities = process.env.NODE_ENV === 'production';
const sessionConfig = {
  maxAge: 60 * 60 * 24 * 30, // 30 days
  secret: process.env.COOKIE_SECRET || '',
};

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  protectIdentities,
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
  passwordResetLink: {
    sendToken(args) {
      console.log(`Password reset info:`, args);
    },
  },
});

export default withAuth(
  config({
    db: {
      adapter: 'mongoose',
      url: databaseUrl,
      onConnect: async context => {
        if (process.argv.includes('--seed-data')) {
          insertSeedData(context);
        }
      },
    },
    lists,
    extendGraphqlSchema,
    ui: {
      // Anyone who has been assigned a role can access the Admin UI
      isAccessAllowed: ({ session }) => !!session?.data.role,
    },
    session: withItemData(statelessSessions(sessionConfig), {
      // Cache the permission fields from the role in the session so we don't have to look them up again in access checks
      User: `id name role { ${permissionsList.join(' ')} }`,
    }),
  })
);
