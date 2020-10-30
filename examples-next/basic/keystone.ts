import { config } from '@keystone-next/keystone/schema';
import { statelessSessions, withItemData } from '@keystone-next/keystone/session';
import { createAuth } from '@keystone-next/auth';

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
});

// TODO -- Create a separate example for access control in the Admin UI
// const isAccessAllowed = ({ session }: { session: any }) => !!session?.item?.isAdmin;

export default auth.withAuth(
  config({
    name: 'Keystone 2020 Spike',
    db: {
      adapter: 'mongoose',
      url: 'mongodb://localhost/keystone-examples-next-basic',
    },
    graphql: {
      // NOTE -- this is not implemented, keystone currently always provides a graphql api at /api/graphql
      path: '/api/graphql',
    },
    admin: {
      // NOTE -- this is not implemented, keystone currently always provides an admin ui at /
      path: '/admin',
      // isAccessAllowed,
      /* TODO -- Create a separate example for custom pages in the Admin UI */
      getAdditionalFiles: [
        () => [
          {
            mode: 'write',
            outputPath: 'pages/custom.js',
            src: 'export default function Something() { return "This is a custom page." }',
          },
        ],
      ],
    },
    lists,
    extendGraphqlSchema,
    session: withItemData(
      statelessSessions({
        maxAge: sessionMaxAge,
        secret: sessionSecret,
      }),
      { User: 'name isAdmin' }
    ),
    // TODO -- Create a separate example for stored/redis sessions
    // session: storedSessions({
    //   store: new Map(),
    //   // store: redisSessionStore({ client: redis.createClient() }),
    //   secret: sessionSecret,
    // }),
  })
);
