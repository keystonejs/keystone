import {
  config,
  statelessSessions,
  // storedSessions
} from '@keystone-spike/keystone/schema';
// import { redisSessionStore } from '@keystone-spike/session-store-redis';
// import redis from 'redis';
import { lists, extendGraphqlSchema } from './schema';
import { createAuth } from '@keystone-spike/auth';

let sessionSecret =
  'a very very good secreta very very good secreta very very good secreta very very good secret';

const withItemData = (i: any) => i;

const auth = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['email', 'password'],
  },
});

const isAccessAllowed = ({ session }: { session: any }) => !!session?.listKey;

export default auth.withAuth(
  config({
    name: 'Keystone 2020 Spike',
    db: {
      adapter: 'mongoose',
      url: 'mongodb://localhost/test-project-5',
    },
    graphql: {
      // NOTE -- this is not implemented, the spike always provides a graphql api at /api/graphql
      path: '/api/graphql',
    },
    admin: {
      // NOTE -- this is not implemented, the spike always provides an admin ui at /
      path: '/admin',
      isAccessAllowed,
      getAdditionalFiles: [
        () => [
          {
            mode: 'write',
            outputPath: 'pages/something.js',
            src: 'export default function Something() {return "wowza"}',
          },
        ],
      ],
    },
    lists,
    extendGraphqlSchema,
    session: withItemData(
      statelessSessions({
        secret: sessionSecret,
      })
      // { User: 'name isAdmin' }
    ),
    // session: storedSessions({
    //   store: new Map(),
    //   // store: redisSessionStore({ client: redis.createClient() }),
    //   secret: sessionSecret,
    // }),
  })
);
