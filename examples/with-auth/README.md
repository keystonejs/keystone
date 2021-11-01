## Feature Example - Authentication

This project demonstrates how to add password based authentication to your Keystone system.
It builds on the [Task Manager](../task-manager) starter project.

## Instructions

To run this project, clone the Keystone repository locally then navigate to this directory and run:

```shell
yarn dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

## Features

This project demonstrates how to add authentication to a Keystone system.
It uses the [`@keystone-next/auth`](https://keystonejs.com/docs/apis/auth) package, along with Keystone's [session management API](https://keystonejs.com/docs/apis/session), to add the following features to the Task Manager base:

- Configure which fields to use for signin
- Set up stateless session handling to keep track of the signed in user
- Add a signin screen to the Admin UI
- Add a signout button to the Admin UI
- Allow the signed in user to access their own details in the Admin UI
- Add a helper page to the Admin UI to allow you to create your first user when starting from an empty database

### Added fields

We add two new fields, `email` and `password`, to the `Person` list.
These are used as our _identity_ and _secret_ fields for login.

```typescript
    email: text({ isIndexed: 'unique', validation: { isRequired: true } }),
    password: password({ isNullable: false, validation: { isRequired: true } }),
```

### Auth config

We use the `createAuth` function from `@keystone-next/auth` to configure a `withAuth` config wrapper, which will inject all the extra config used to enable authentication.

```typescript
import { createAuth } from '@keystone-next/auth';

const { withAuth } = createAuth({
  listKey: 'Person',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: { fields: ['name', 'email', 'password'] },
});
```

### Session

We use a basic `statelessSessions` from `@keystone-next/keystone/session` for session handling.
You need to have sessions enabled in order to use the `withAuth` config wrapper.

```typescript
import { statelessSessions } from '@keystone-next/keystone/session';

const session = statelessSessions({ secret: '-- EXAMPLE COOKIE SECRET; CHANGE ME --' });
```

### Wrapped config

We wrap our config using the `withAuth` function, which injects added Admin UI configuration, as well as the GraphQL queries and mutations for authentication.

```typescript
export default withAuth(
  config({
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./keystone-example.db',
    },
    lists,
    session,
  })
);
```
