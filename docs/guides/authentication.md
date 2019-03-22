---
section: guides
title: Authentication
---

# Authentication

_Note on terminology_:

- _Authentication_ refers to a user identifying themselves.
  Within this document, we abbreviate _Authentication_ to _Auth_.
- _Access Control_ refers to the specific actions an authenticated or anonymous
  user can take. Often referred to as _authorization_ elsewhere.
  The specifics of how this is done is outside the scope of this document.
  See [Access Control](../access-control.md) for more.

## Admin UI

Username / Password authentication can be enabled on the Admin UI.

> NOTE: Admin Authentication will only restrict access to the Admin _UI_.
> To also restrict access to the _API_,
> you must setup [Access Control](../access-control.md) config.

First, setup [a `PasswordAuthStrategy` instance](#passwordauthstrategy).

Then, pass that instance into the Admin UI setup:

```javascript
const { AdminUI } = require('@keystone-alpha/admin-ui');
const PasswordAuthStrategy = require('@keystone-alpha/keystone/auth/Password');

const keystone = // ...

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

const admin = new AdminUI(keystone, {
  adminPath: '/admin',
  authStrategy,
});
```

The Admin UI will then come with the correct routes and checks for
authentication against the UI.

## Strategies

Auth strategies are
[documented in the keystone package](../../packages/keystone/auth/README.md).
