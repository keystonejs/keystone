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
const { WebServer } = require('@voussoir/server');
const PasswordAuthStrategy = require('@voussoir/core/auth/Password');

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

Auth strategies are
[documented in the core package](../packages/core/auth/README.md).
