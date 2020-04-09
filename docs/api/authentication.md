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
const { Text, Checkbox, Password } = require('@keystonejs/fields');

const keystone = new Keystone({...});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text, isUnique: true },
    isAdmin: { type: Checkbox },
    password: { type: Password },
  },
  authStrategies: {
    password: {
      type: PasswordAuthStrategy,
    },
  },
});
```

You then provide `authStrategy` to apps that facilitate login (typically the Admin UI) in the format `<list>.<strategy>`:

```javascript title=index.js
module.exports = {
  keystone,
  apps: [new AdminUIApp({ authStrategy: 'User.password' })],
};
```

## Config

| Option | Type           | Default    | Description                      |
| ------ | -------------- | ---------- | -------------------------------- |
| `type` | `AuthStrategy` | (required) | A valid authentication strategy. |

> **Note:** Different authentication strategies may have additional config options. See the documentation for individual authentication strategies for more details.

### `type`

A valid authentication strategy.

### Additional Config Options

Any additional config options are passed directly to your chosen authentication strategy. See their documentation for valid options.
