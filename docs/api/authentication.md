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
  hooks: {...},
  plugins: [...],
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

| Option    | Type           | Default    | Description                                                                             |
| --------- | -------------- | ---------- | --------------------------------------------------------------------------------------- |
| `type`    | `AuthStrategy` | (required) | A valid authentication strategy.                                                        |
| `list`    | `String`       | (required) | The list that contains an authenticated item, for example a user.                       |
| `config`  | `Object`       | `{}`       | Strategy-specific config options.                                                       |
| `hooks`   | `Object`       | `{}`       | Authentication mutation hooks. See the [hooks API docs](/docs/api/hooks.md) for details |
| `plugins` | `Array`        | `[]`       | An array of `plugins` that can modify the authentication strategy config.               |

> **Note:** Different authentication strategies may have additional config options. See the documentation for individual authentication strategies for more details.

### `type`

A valid authentication strategy.

### `list`

Authentication strategies need to authenticate an item in a Keystone list (typically a User). The authenticated item will be provided to access control functions.

This list should have the `{ auth: true }` access control set. See the [Access control API](https://www.keystonejs.com/api/access-control) docs for more details.

### `plugins`

An array of functions that modify option values. Plugin functions receive `(options, { keystone })`, where `options` is the objects passed to `createAuthStrategy` (e.g. `{ type, list, config, hooks, plugins}`), and `keystone` is the keystone object. They should return a valid options value. Plugin functions are executed in the order provided in the list, with the output options of one being passed as input to the next. The output of the final plugin is used to construct the authentication strategy.

```javascript
const logAuth = ({ hooks, ...options }) => {
  return {
    ...options,
    hooks: {
      afterAuth: () => console.log('A user logged in!'),
      ...hooks,
    },
  };
};

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  plugin: [logAuth],
});
```

This provides a method for packaging features that can be applied to multiple lists.
