import { config } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import { createAuth } from '@keystone-6/auth';

import { lists, extendGraphqlSchema } from './schema';

let sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';
let sessionMaxAge = 60 * 60 * 24 * 30; // 30 days

const auth = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    itemData: {
      isAdmin: true,
    },
  },
  sessionData: 'name isAdmin',
});

export default auth.withAuth(
  config({
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./keystone-example.db',
    },
    storage: {
      my_images: {
        kind: 'local',
        type: 'file',
        storagePath: 'public/images',
        generateUrl: path => `http://localhost:3000/images${path}`,
        serverRoute: {
          path: '/images',
        },
      },
      my_files: {
        kind: 'local',
        type: 'file',
        storagePath: 'public/files',
        generateUrl: path => `http://localhost:3000/files${path}`,
        serverRoute: {
          path: '/files',
        },
      },
    },
    lists,
    extendGraphqlSchema,
    session: statelessSessions({ maxAge: sessionMaxAge, secret: sessionSecret }),
  })
);
