## Feature Example - Invalidate Session Token

This project demonstrates how to invalidate a session when a password is changed using password based authentication in your Keystone system.
It builds on the [With Auth](../with-auth) example project.

## Instructions

To run this project, clone the Keystone repository locally, run `yarn` at the root of the repository then navigate to this directory and run:

```shell
yarn dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

## Features

Based on the [With auth example](../with-auth/), this project demonstrates how to customise the kestone session configuration in order to invalidate a session when a user's passsword is changed.
It uses the [`@keystone-6/auth`](https://keystonejs.com/docs/apis/auth) package, along with Keystone's [session management API](https://keystonejs.com/docs/apis/session), to add the following features:

- Adds a hooks to the `password` field to set a timestamp field when the user changes their password
- Changes the stateless session handling to set the time a session starts
- Checks the session start time against when the user's password was last changed and returns no session if the password was changed _after_ the session started.

### Added fields

We add one new field, `passwordChangedAt`, to the `Person` list. Setting the `passwordChangedAt` field to hidden with access not allowed, means this field will not be visible to the user. We then add an `afterOperation` hook on the `password` field to set the `passwordChangedAt` field when the password is changed.

```typescript
    email: text({ isIndexed: 'unique', validation: { isRequired: true } }),
    password: password({
        validation: { isRequired: true },
        hooks: {
          afterOperation: async ({ item, context }) => {
            if (!item) return;
            const sudo = context.sudo();
            await sudo.db.Person.updateOne({
              where: { id: item.id as string },
              data: { passwordChangedAt: new Date() },
            });
          },
        },
      }),
    passwordChangedAt: timestamp({
        access: () => false,
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
});
```

### Session

We can then change the default `statelessSessions` by passing in a new `start` and `get` functions. In the `start` function, we add the `startTime` to the session and start the session using keystone's `start` session function. we can then customise the `get` function to check this `startTime` on the session and compare it to the `passwordChangedAt` time stored in the `Person` table.

```typescript
import { statelessSessions } from '@keystone-6/core/session';
const sessionAge = 60 * 60 * 8; // 8 hours

const withTimeData = (
  _sessionStrategy: SessionStrategy<Record<string, any>>
): SessionStrategy<{ startTime: string }> => {
  const { get, start, ...sessionStrategy } = _sessionStrategy;
  return {
    ...sessionStrategy,
    get: async ({ req, createContext }) => {
      const session = await get({ req, createContext });
      const sudoContext = createContext({ sudo: true });
      if (!session || !session.listKey || !session.startTime) {
        return;
      }
      const data = await sudoContext.query[session.listKey].findOne({
        where: { id: session.itemId },
        query: 'passwordChangedAt',
      });
      if (!data) return;
      if (data.passwordChangedAt > session.startTime) return;
      return { ...session, startTime: session.startTime };
    },
    start: async ({ res, data, createContext }) => {
      const withTimeData = {
        ...data,
        startTime: new Date(),
      };
      const newSession = await start({ res, data: withTimeData, createContext });
      return newSession;
    },
  };
};

const session = withTimeData(
  statelessSessions({
    // The session secret is used to encrypt cookie data (should be an environment variable)
    maxAge: sessionAge,
    secret: '-- EXAMPLE COOKIE SECRET; CHANGE ME --',
  })
);
```

## Try it out in CodeSandbox 🧪

You can play with this example online in a web browser using the free [codesandbox.io](https://codesandbox.io/) service. To launch this example, open the URL https://githubbox.com/keystonejs/keystone/tree/main/examples/custom-session-validation. You can also fork this sandbox to make your own changes.
