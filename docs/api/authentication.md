<!--[meta]
section: api
title: Authentication
order: 5
[meta]-->

# Authentication

Authentication strategies allow users to identify themselves to Keystone.
This can be used to restrict access to the AdminUI, and to configure [access controls](/docs/guides/access-control.md).

- For password logins see: [`auth-password`](/packages/auth-password/README.md)
- For social logins using [Passport.js](http://www.passportjs.org/) see: [`auth-passport`](/packages/auth-passport/README.md)

## Usage

```javascript title=index.js
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');

const keystone = new Keystone({...});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  config: {...},
});
```

You then provide `authStrategy` to apps that facilitate login (typically the Admin UI):

```javascript title=index.js
module.exports = {
  keystone,
  apps: [new AdminUIApp({ authStrategy })],
};
```

## Config

| Option   | Type           | Default    | Description                                                       |
| -------- | -------------- | ---------- | ----------------------------------------------------------------- |
| `type`   | `AuthStrategy` | (required) | A valid authentication strategy.                                  |
| `list`   | `String`       | (required) | The list that contains an authenticated item, for example a user. |
| `config` | `Object`       | `{}`       | Strategy-specific config options.                                 |

> **Note:** Different authentication strategies may have additional config options. See the documentation for individual authentication strategies for more details.

### `type`

A valid authentication strategy.

### `list`

Authentication strategies need to authenticate an item in a Keystone list (typically a User). The authenticated item will be provided to access control functions.

This list should have the `{ auth: true }` access control set. See the [Access control API](https://www.keystonejs.com/api/access-control) docs for more details.
