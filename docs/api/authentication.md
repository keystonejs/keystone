<!--[meta]
section: api
title: Authentication
order: 4
[meta]-->

# Authentication

Authentication strategies allow users to identify themselves to KeystoneJS. This can be used to restrict access to the AdminUI, and to configure [access controls](/guides/access-control/).

- For password logins see: [`auth-password`](/keystonejs/auth-password/)
- For social logins using [Passport.js](http://www.passportjs.org/) see: [`auth-passport`](/keystonejs/auth-passport/)

## Usage

```javascript
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  config: {
    /*...config */
  },
});
```

You then provide `authStrategy` to apps that facilitate login (typically the Admin UI):

```javascript
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

_Note_: Different authentication strategies may have additional config options. See the documentation for individual authentication strategies for more details.

### `type`

A valid authentication strategy.

### `list`

Authentication strategies need to authenticate an item in a Keystone list (typically a User). The authenticated item will be provided to access control functions.
