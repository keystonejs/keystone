# Authentication

_Note on terminology_:

- _Authentication_ refers to a user identifying themselves.
  Within this document, we abbreviate _Authentication_ to _Auth_.
- _Access Control_ refers to the specific actions an authenticated or anonymous
  user can take. Often referred to as _authorization_ elsewhere.
  The specifics of how this is done is outside the scope of this document.
  See [Access Control](./access-control.md) for more.

## Admin UI

Username / Password authentication can be enabled on the Admin UI.

> NOTE: Admin Authentication will only restrict access to the Admin _UI_.
> To also restrict access to the _API_,
> you must setup [Access Control](./access-control.md) config.

First, setup [a `PasswordAuthStrategy` instance](#passwordauthstrategy).

Then, pass that instance into the Web Server setup:

```javascript
const { WebServer } = require('@keystonejs/server');
const PasswordAuthStrategy = require('@keystonejs/core/auth/Password');

const keystone = // ...

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

const server = new WebServer(keystone, {
  authStrategy: authStrategy,
  // ... other config
});
```

The Admin UI will then come with the correct routes and checks for
authentication against the UI.

## Strategies

### `PasswordAuthStrategy`

This strategy requires two fields to exist on a given list:

- `username: Text`
- `password: Password`

The values of these fields will then be checked against when verifying a user
login:

```javascript
const { Text, Password } = require('@keystonejs/fields');
const PasswordAuthStrategy = require('@keystonejs/core/auth/Password');

// NOTE: Order of list/auth creation here is not important
keystone.createList('User', {
  fields: {
    email: { type: Text },
    password: { type: Password },
    // ... other fields
  },
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

// ... Later on, in some route handler

const username = // ...
const password = // ...

const result = await this.authStrategy.validate({
  username,
  password,
});

if (result.success) {
  // Valid credentials
}
```
