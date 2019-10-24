<!--[meta]
section: api
subSection: apps
title: Admin UI
[meta]-->

# KeystoneJS Admin UI App

A KeystoneJS App which provides an Admin UI for content management.

## Usage

```js
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');

const authStrategy = keystone.createAuthStrategy({ ... });

...

module.exports = {
  new Keystone(),
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
        adminPath: '/admin',
        authStrategy,
    }),
  ],
};
```

### Config

| Option               | Type     | Default      | Required | Description                                                                  |
| -------------------- | -------- | ------------ | -------- | ---------------------------------------------------------------------------- |
| `adminPath`          | `String` | `/admin`     | `false`  | The path of the Admin UI.                                                    |
| `apiPath`            | `String` | `/admin/api` | `false`  | The path of the API provided to the Admin UI.                                |
| `graphiqlPath`       | `String` | `/admin/api` | `false`  | The path of the graphiql app, an in-browser IDE for exploring GraphQL.       |
| `authStrategy`       | `Object` | `null`       | `false`  | See [Authentication Guides](https://keystonejs.com/guides/authentication) |
| `pages`              | `Array`  | `null`       | `false`  |                                                                              |
| `enableDefaultRoute` | `Bool`   | `false`      | `false`  | If enabled, the path of the Admin UI app will be set to `/`.                 |
| `schemaName`         | `String` | `public`     | `false`  |                                                                              |
