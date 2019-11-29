<!--[meta]
section: api
subSection: apps
title: Admin UI app
[meta]-->

# Admin UI app

[![View changelog](https://img.shields.io/badge/changelogs.xyz-Explore%20Changelog-brightgreen)](https://changelogs.xyz/@keystonejs/app-admin-ui)

A KeystoneJS app which provides an Admin UI for content management.

## Usage

```js
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');

keystone.createList('User', { ... });

module.exports = {
  keystone: new Keystone(),
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      adminPath: '/admin',
      authStrategy: 'User.<authStrategyName>',
    }),
  ],
};
```

### Config

| Option               | Type       | Default      | Required | Description                                                                  |
| -------------------- | ---------- | ------------ | -------- | ---------------------------------------------------------------------------- |
| `adminPath`          | `String`   | `/admin`     | `false`  | The path of the Admin UI.                                                    |
| `apiPath`            | `String`   | `/admin/api` | `false`  | The path of the API provided to the Admin UI.                                |
| `graphiqlPath`       | `String`   | `/admin/api` | `false`  | The path of the graphiql app, an in-browser IDE for exploring GraphQL.       |
| `authStrategy`       | `String`   | `undefined`  | `false`  | See the [Authentication guide](https://keystonejs.com/guides/authentication) |
| `pages`              | `Array`    | `null`       | `false`  |                                                                              |
| `enableDefaultRoute` | `Bool`     | `false`      | `false`  | If enabled, the path of the Admin UI app will be set to `/`.                 |
| `schemaName`         | `String`   | `public`     | `false`  |                                                                              |
| `isAccessAllowed`    | `Function` | `true`       | `false`  | Controls which users have access to the Admin UI.                            |

### `isAccessAllowed`

This function takes the same arguments as a [shorthand imperative boolean](https://www.keystonejs.com/api/access-control#shorthand-imperative-boolean) access control. It must return either true or false.

If omitted, all users _with accounts_ will be able to access the Admin UI. The example below would restrict access to users with the `isAdmin` permission.

#### Usage

```js
new AdminUIApp({
  /*...config */
  isAccessAllowed: ({ authentication: { item: user, listKey: list } }) => !!user && !!user.isAdmin,
}),
```
