## Feature Example - Invalidate Session Token

This project demonstrates how to invalidate a session when a password is changed using password-based authentication in your Keystone system.
It builds on the [Authentication example](../with-auth) project.

## Instructions

To run this project, clone the Keystone repository locally, run `pnpm install` at the root of the repository then navigate to this directory and run:

```shell
pnpm dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

## Features

Based on the [Authentication example](../with-auth/), this project demonstrates how to customize the keystone session configuration in order to invalidate a session when a user's password is changed.
It uses the [`@keystone-6/auth`](https://keystonejs.com/docs/config/auth) package, along with Keystone's [session management API](https://keystonejs.com/docs/config/session), to add the following features:

- Adds a hook to the `password` field to set a timestamp field when the user changes their password
- Changes the stateless session handling to set the time a session starts
- Checks the session start time against when the user's password was last changed and returns no session if the password was changed _after_ the session started.

### Added fields

We add one new field, `passwordChangedAt`, to the `Person` list. Setting the `passwordChangedAt` field to hidden with access not allowed means this field will not be visible to the user. We then add a `resolveInput` hook on the `passwordChangedAt` field to set it to the current time whenever the password is changed. If the password has not changed (ie `resolvedData.password` is undefined) `resolvedInput` returns undefined for `passwordChangedAt` and therefore will not be updated.

```typescript
    email: text({ isIndexed: 'unique', validation: { isRequired: true } }),
    password: password({
        validation: { isRequired: true },
      }),
    passwordChangedAt: timestamp({
        access: () => false,
        hooks: {
          resolveInput: ({ resolvedData }) => {
            if (resolvedData.password) {
              return new Date();
            }
            return;
          },
        },
        ui: {
          createView: { fieldMode: 'hidden' },
          itemView: { fieldMode: 'hidden' },
          listView: { fieldMode: 'hidden' },
        },
      }),
```

### Auth config

The `withAuth` config stays the same.

```typescript
import { createAuth } from '@keystone-6/auth';

const { withAuth } = createAuth({
  listKey: 'Person',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: { fields: ['name', 'email', 'password'] },
  sessionData: 'id passwordChangedAt',
});
```

### Session

We can then change the default `statelessSessions` by passing in a new `start` and `get` functions. In the `start` function, we add the `startTime` to the session and start the session using keystone's `start` session function. we can then customize the `get` function to check this `startTime` on the session and compare it to the `passwordChangedAt` time stored in the `Person` table.

```typescript
import { statelessSessions } from '@keystone-6/core/session';
const maxSessionAge = 60 * 60 * 8; // 8 hours, in seconds

const withTimeData = (
  _sessionStrategy: SessionStrategy<Record<string, any>>
): SessionStrategy<Record<string, any>> => {
  const { get, start, ...sessionStrategy } = _sessionStrategy;
  return {
    ...sessionStrategy,
    get: async ({ req, createContext }) => {
      const session = await get({ req, createContext });
      if (!session || !session.startTime) return;
      if (session.data.passwordChangedAt === null) return session;
      if (session.data.passwordChangedAt === undefined) {
        throw new TypeError('passwordChangedAt is not listed in sessionData');
      }
      if (session.data.passwordChangedAt > session.startTime) {
        return;
      }

      return session;
    },
    start: async ({ res, data, createContext }) => {
      const withTimeData = {
        ...data,
        startTime: new Date(),
      };
      return await start({ res, data: withTimeData, createContext });
    },
  };
};

const myAuth = (keystoneConfig: KeystoneConfig): KeystoneConfig => {
  // Add the session strategy to the config
  if (!keystoneConfig.session) throw new TypeError('Missing .session configuration');
  return {
    ...keystoneConfig,
    session: withTimeData(keystoneConfig.session),
  };
};
```

### Wrapped config

We now wrap our `withAuth` function inside the `myAuth` function which injects the custom session validation in the correct sequence.

```typescript
export default myAuth(
  withAuth(
    config({
      db: {
        provider: 'sqlite',
        url: process.env.DATABASE_URL || 'file:./keystone-example.db',
      },
      lists,
      // We add our session configuration to the system here.
      session,
    })
  )
);
```

## Try it out in CodeSandbox 🧪

You can play with this example online in a web browser using the free [codesandbox.io](https://codesandbox.io/) service. To launch this example, open the URL <https://githubbox.com/keystonejs/keystone/tree/main/examples/custom-session-validation>. You can also fork this sandbox to make your own changes.
