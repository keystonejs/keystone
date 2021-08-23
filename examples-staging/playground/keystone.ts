import { config } from '@keystone-next/keystone';
import { lists } from './schema';

// graphql.apolloConfig.playground === false (playground not accessible in all cases, introspection will be disabled by default)
// export default config({
//   db: {
//     provider: 'sqlite',
//     url: process.env.DATABASE_URL || 'file:./keystone-example.db',
//   },
//   lists,
//   graphql: {
//     apolloConfig: {
//       playground: false,
//     }
//   }
// });

// graphql.apolloConfig.playground === true (playground accessible in all cases, introspection will be enabled by default)
// export default config({
//   db: {
//     provider: 'sqlite',
//     url: process.env.DATABASE_URL || 'file:./keystone-example.db',
//   },
//   lists,
//   graphql: {
//     apolloConfig: {
//       playground: true,
//     },
//   },
// });

// graphql.apolloConfig.playground === true && graphql.apolloConfig.introspection === false (playground accessible in all cases, introspection disabled)
// export default config({
//   db: {
//     provider: 'sqlite',
//     url: process.env.DATABASE_URL || 'file:./keystone-example.db',
//   },
//   lists,
//   graphql: {
//     apolloConfig: {
//       playground: true,
//       introspection: false,
//     },
//   },
// });

// graphql.apolloConfig.playground === { settings: ... } (playground accessible in all cases with further customisation - https://www.apollographql.com/docs/apollo-server/testing/graphql-playground, introspection will be enabled by default)
// export default config({
//   db: {
//     provider: 'sqlite',
//     url: process.env.DATABASE_URL || 'file:./keystone-example.db',
//   },
//   lists,
//   graphql: {
//     apolloConfig: {
//       playground: {
//         settings: {
//           'editor.theme': 'light',
//         }
//       },
//     }
//   }
// });

// process.env.NODE_ENV === 'production' (playground not accessible in production, introspection will be disabled by default)
// process.env.NODE_ENV = 'production';
// export default config({
//   db: {
//     provider: 'sqlite',
//     url: process.env.DATABASE_URL || 'file:./keystone-example.db',
//   },
//   lists,
//   graphql: {
//     apolloConfig: {
//       playground: false,
//     }
//   }
// });

// not specified at all (playground and introspection uses defaults, enabled in development and disabled in production)
export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
  },
  lists,
});
