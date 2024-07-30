---
title: "Authentication"
description: "API reference for supporting authentication against a password field using the createAuth() function in the `@keystone-6/auth` package."
---

Keystone allows you to extend your Keystone system to support authentication against a `password` field using the `createAuth()` function in the `@keystone-6/auth` package.
Additional options to this function provide support for creating an initial item in your database, sending password reset tokens, and sending one-time authentication tokens.

For examples of how to use authentication in your system please see the [authentication guide](../guides/auth-and-access-control).

```typescript
import { config, list } from '@keystone-6/core'
import { text, password, checkbox } from '@keystone-6/core/fields'
import { createAuth } from '@keystone-6/auth'

const { withAuth } = createAuth({
  // Required options
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',

  // Additional options
  sessionData: 'id name email',
  initFirstItem: {
    fields: ['email', 'password'],
    itemData: { isAdmin: true },
    skipKeystoneWelcome: false,
  },
})

export default withAuth(
  config({
    lists: {
      User: list({
        fields: {
          email: text({ isIndexed: 'unique' }),
          password: password(),
          isAdmin: checkbox(),
        },
      }),
      session: { /* ... */ },
    },
  })
)
```

The function `createAuth` returns a function `withAuth` which should be used to wrap your `config()`.
This wrapper function will modify the config object to inject extra fields, extra GraphQL queries and mutations, and custom Admin UI functionality into the system.
The `createAuth` function must be used in conjunction with a [session](./session) configuration.

## Required options

The core functionality of the authentication system provides a GraphQL mutation to authenticate a user and then start a session, and a sign in page in the Admin UI.

- `listKey`: The name of the list to authenticate against.
- `identityField`: The name of the field to use as an identity field. This field must have `{ isIndexed: 'unique' }` set.
- `secretField`: The name of the field to use as a secret. This field must be a `password()` field type.

```typescript
import { createAuth } from '@keystone-6/auth'

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
})
```

#### GraphQL API {% #graphql-api %}

The following elements will be added to the GraphQL API.

```graphql
type Mutation {
  authenticateUserWithPassword(email: String!, password: String!): UserAuthenticationWithPasswordResult!
  endSession: Boolean!
}

type Query {
  authenticatedItem: AuthenticatedItem
}

union AuthenticatedItem = User

union UserAuthenticationWithPasswordResult = UserAuthenticationWithPasswordSuccess | UserAuthenticationWithPasswordFailure

type UserAuthenticationWithPasswordSuccess {
  sessionToken: String!
  item: User!
}

type UserAuthenticationWithPasswordFailure {
  message: String!
}
```

##### authenticateUserWithPassword

This mutation will check the supplied credentials and start a new [session](./session) if the credentials are valid.
The argument names for this function are the values of `identityField` and `secretField`.

```graphql
mutation {
  authenticateUserWithPassword(
    email: "username@example.com",
    password: "password"
  ) {
   ... on UserAuthenticationWithPasswordSuccess {
    item {
      id
      email
    }
  }
    ... on UserAuthenticationWithPasswordFailure {
      message
    }
  }
}
```

On success the session handler will start a new session and return the encoded session cookie data as `sessionToken`.
The authenticated item will be returned as `item`.

On failure the values `{ code: FAILURE, message: "Authentication failed." }` will be returned.

##### authenticatedItem

This query will return the currently logged in user, based on the `session` data.

#### Admin UI

A sign in page at the path `/signin` will be added to the Admin UI.
If a user tries to access the Admin UI without having logged in they will be redirected back to `/signin`.
This page uses the `authenticateUserWithPassword` mutation to let users sign in to the Admin UI.

## Additional options

The following options add extra functionality to your Keystone authentication system.
By default they are disabled.

### sessionData

This option adds support for setting a custom `session.data` value based on the authenticated user.

The authentication mutations will set the values `{ listKey, itemId }` on the `context.session` object.
You will often need to know more than just the `itemId` of the authenticated user, such as when performing [access-control](../guides/auth-and-access-control) or using [hooks](../guides/hooks).
Configuring `sessionData` will add an `session.data` based on the `itemId`, populated by the fields given in `sessionData.query`.

The value is a GraphQL query string which indicates which fields should be populated on the `session.data` object

```typescript
import { createAuth } from '@keystone-6/auth'

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'id name isAdmin',
})
```

### initFirstItem

This option adds support for bootstrapping the first user into the system via the Admin UI.
If this option is enabled and there are no users in the system, the Admin UI will present a form to create an initial user in the system.
Once the user is created, they will be presented with a Keystone Welcome screen, and prompted to sign up to the Keystone mailing list to receive updates about the project.

#### Options {% #init-first-item-options %}

- `fields` (required): A list of fields to include in the initial user form.
- `itemData` (default: `{}`): An object containing extra data to add to the initial user.
- `skipKeystoneWelcome` (default: `false`): A flag to skip display of the Keystone Welcome screen.

```typescript
import { createAuth } from '@keystone-6/auth';

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',

  initFirstItem: {
    fields: ['email', 'password'],
    itemData: { isAdmin: true },
    skipKeystoneWelcome: false,
  },
});
```

#### GraphQL API {% #init-first-item-graphql-api %}

Enabling `initFirstItem` will add the following elements to the GraphQL API.

```graphql
type Mutation {
  createInitialUser(data: CreateInitialUserInput!): UserAuthenticationWithPasswordSuccess!
}

input CreateInitialUserInput {
  name: String
  email: String
  password: String
}
```

##### createInitialUser

This mutation will create a new user in the system.
If a user already exists an error will be returned.
The available input fields are based on the `fields` options.
This mutation is used by the Admin UI's initial user screen and should generally not be called directly.

#### Admin UI {% #init-first-item-admin-ui %}

The initial user screen is added at `/init`, and users are redirected here if there is no active session and no users in the system.

## Related resources

{% related-content %}
{% well
heading="Example Project: Authentication"
href="https://github.com/keystonejs/keystone/tree/main/examples/auth" %}
Adds password-based authentication to the Task Manager starter project.
{% /well %}
{% /related-content %}
