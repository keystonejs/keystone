import {
  config,
  // storedSessions
} from '@keystone-spike/keystone/schema';
import { statelessSessions, withItemData } from '@keystone-spike/keystone/session';
// import { redisSessionStore } from '@keystone-spike/session-store-redis';
// import redis from 'redis';
import { lists, extendGraphqlSchema } from './schema';
import { createAuth } from '@keystone-spike/auth';

let sessionSecret =
  'a very very good secreta very very good secreta very very good secreta very very good secret';
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
  passwordResetLink: {
    sendToken(args) {
      console.log(`Password reset info:`, args);
    },
  },
  magicAuthLink: {
    sendToken(args) {
      console.log(`Magic auth info:`, args);
    },
  },
});

// const isAccessAllowed = ({ session }: { session: any }) => !!session?.item?.isAdmin;

export default auth.withAuth(
  config({
    name: 'Keystone 2020 Spike',
    db: {
      adapter: 'mongoose',
      url: 'mongodb://localhost/keystone-examples-next-basic',
    },
    graphql: {
      // NOTE -- this is not implemented, the spike always provides a graphql api at /api/graphql
      path: '/api/graphql',
    },
    admin: {
      // NOTE -- this is not implemented, the spike always provides an admin ui at /
      path: '/admin',
      // isAccessAllowed,
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
        maxAge: sessionMaxAge,
        secret: sessionSecret,
      }),
      { User: 'name isAdmin' }
    ),
    // session: storedSessions({
    //   store: new Map(),
    //   // store: redisSessionStore({ client: redis.createClient() }),
    //   secret: sessionSecret,
    // }),
  })
);
