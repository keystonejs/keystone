<!--[meta]
section: guides
title: Authentication
subSection: advanced
[meta]-->

# Authentication

A note on terminology:

- **Authentication** refers to a user identifying themselves.
  Within this document, we abbreviate _Authentication_ to _Auth_.
- **Access control** refers to the specific actions an authenticated or anonymous
  user can take. Often referred to as _authorization_ elsewhere.
  The specifics of how this is done is outside the scope of this document.
  See [access control](/docs/guides/access-control.md) for more.

## Admin UI

Username / Password authentication can be enabled on the Admin UI.

> **Important:** Admin Authentication will only restrict access to the Admin _UI_. It _will not_ restrict API access. To also restrict access to the API, you must set up [Access controls](/docs/guides/access-control.md).

To setup authentication, you must instantiate an _Auth Strategy_, and create a
list used for authentication in `index.js`. Here, we will setup a
`PasswordAuthStrategy` instance:

```javascript
const { Keystone } = require('@keystonejs/keystone');
const { Text, Password } = require('@keystonejs/fields');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');

const keystone = new Keystone();

keystone.createList('User', {
  fields: {
    username: { type: Text },
    password: { type: Password },
  },
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  config: {
    identityField: 'username', // default: 'email'
    secretField: 'password', // default: 'password'
  },
});

// Enable Admin UI login by adding the authentication strategy
const admin = new AdminUIApp({ authStrategy });
```

Once your Keystone server is restarted, the Admin UI will now enforce
authentication.

### Logging in to the Admin UI

The first time you setup authentication, you may not be able to login. This is
because there are no `User`s who can do the logging in.

First, disable authentication on the Admin UI by removing `authStrategy` from
the `new AdminUIApp()` call:

```diff
- const admin = new AdminUIApp({ authStrategy });
+ const admin = new AdminUIApp();
```

Second, disable access control by removing `access` from the
`keystone.createList('User', ...` call:

```diff
-  access: {
-    read: access.userIsAdminOrOwner,
-    update: access.userIsAdminOrOwner,
-    create: access.userIsAdmin,
-    delete: access.userIsAdmin,
-    auth: true,
-  },
```

Restart your Keystone App, and visit <http://localhost:3000/admin/users> - you should now be able to access the Admin UI without logging in.

Next, create a User (be sure to set both a username and password).

Add the `authStrategy` config back to the `new AdminUIApp()` call

```diff
- const admin = new AdminUIApp();
+ const admin = new AdminUIApp({ authStrategy });
```

Restart your Keystone App once more, and try to visit <http://localhost:3000/admin/users>; you will be presented with the login screen.

Finally; login with the newly created `User`'s credentials.

### Programmatic authentication

Each list associated with an auth strategy creates corresponding queries and mutations you can use for programmatic authentication. For a `List` called `User` using the `Password` auth strategy, the following operations are made available:

| Name                           | Type     | Description                                    |
| ------------------------------ | -------- | ---------------------------------------------- |
| `authenticatedUser`            | Query    | Returns the currently authenticated list item. |
| `authenticateUserWithPassword` | Mutation | Authenticates a user.                          |
| `unauthenticateUser`           | Mutation | Unauthenticates the authenticated user.        |

_NOTE:_ these operations may be named differently if the `List.itemQueryName` config option is set.

#### GraphQL

The above configuration would also add the following types to the GraphQL schema:

```graphql
type authenticateUserOutput {
  """
  Used to make subsequent authenticated requests by setting this token in a header: 'Authorization: Bearer <token>'.
  """
  token: String
  """
  Retrieve information on the newly authenticated User here.
  """
  item: User
}

type unauthenticateUserOutput {
  """
  \`true\` when unauthentication succeeds.
  NOTE: unauthentication always succeeds when the request has an invalid or missing authentication token.
  """
  success: Boolean
}
```

> **Remember:** The exact schema will depend on your chosen list and authentication strategy.

#### Usage

Authenticate and return the ID of the newly authenticated user:

```graphql
mutation signin($identity: String, $secret: String) {
  authenticate: authenticateUserWithPassword(email: $identity, password: $secret) {
    item {
      id
    }
  }
}
```

Unauthenticate the currently authenticated user:

```graphql
mutation {
  unauthenticate: unauthenticateUser {
    success
  }
}
```

### Controlling access to the Admin UI

By default, any _authenticated_ user will be able to access the Admin UI. To restrict access, use the `isAccessAllowed` config option.

See the [Admin UI app](https://www.keystonejs.com/keystonejs/app-admin-ui/) docs for more details.

## API access control

Adding Authentication as shown above will only enable login to the Admin UI. It _will not_ restrict API access.

> **Note:** To restrict API access, you must set up [Access controls](/docs/guides/access-control.md)

## Hooks

Keystone provides a collection of hooks to allow you to customise the behaviour of the authentication mutations.
Please see the [hooks API docs](/docs/api/hooks.md) for details on how to use authentication hooks.
