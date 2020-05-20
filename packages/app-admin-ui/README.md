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

const keystone = new Keystone({...});

const authStrategy = keystone.createAuthStrategy({...});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      adminPath: '/admin',
      authStrategy,
    }),
  ],
};
```

## Config

| Option               | Type       | Default       | Required | Description                                                                |
| -------------------- | ---------- | ------------- | -------- | -------------------------------------------------------------------------- |
| `adminPath`          | `String`   | `/admin`      | `false`  | The path of the Admin UI.                                                  |
| `apiPath`            | `String`   | `/admin/api`  | `false`  | The path of the API provided to the Admin UI.                              |
| `graphiqlPath`       | `String`   | `/admin/api`  | `false`  | The path of the graphiql app, an in-browser IDE for exploring GraphQL.     |
| `authStrategy`       | `Object`   | `null`        | `false`  | See [Authentication Guides](https://keystonejs.com/guides/authentication)  |
| `hooks`              | `String`   | `./admin-ui/` | `false`  | Path to customization hooks. See below for more information.               |
| `enableDefaultRoute` | `Bool`     | `false`       | `false`  | If enabled, the path of the Admin UI app will be set to `/`.               |
| `schemaName`         | `String`   | `public`      | `false`  |                                                                            |
| `isAccessAllowed`    | `Function` | `true`        | `false`  | Controls which users have access to the Admin UI.                          |
| `adminMeta`          | `Object`   | `{}`          | `false`  | Provides additional `adminMeta`. Useful for Hooks and other customizations |

### `hooks`

Customization hooks allow you to modify various areas of the Admin UI to better suit your development needs. The `index.js` file at the given path should export a single config object containing your chosen hooks. All are optional.

If omitted, Keystone will look under `./admin-ui/` for a hooks config export.

#### Usage

```javascript title=index.js
new AdminUIApp({ hooks: require.resolve('./custom-hooks-path') });
```

The following hooks are available. Each is a function that takes no arguments.

```javascript title=/custom-hooks-path/index.js
export default {
  logo,
  pages,
};
```

#### `logo`

The logo to display on the signin screen.

Should return a React component.

```javascript
export default {
  logo: () => <MyAwesomeLogo />,
};
```

#### `pages`

Allows grouping list pages in the sidebar or defining completely new pages.

Should return an array of objects, which may contain the following properties:

| Name        | Type             | Description                                                                             |
| ----------- | ---------------- | --------------------------------------------------------------------------------------- |
| `label`     | `String`         | The page name to display in the sidebar.                                                |
| `path`      | `String`         | The page path.                                                                          |
| `component` | `Function|Class` | A React component which will be used to render this page.                               |
| `children`  | `Array`          | An array of either Keystone list keys or objects with `listKey` and `label` properties. |

```javascript
export default {
  pages: () => [
    // Custom pages
    {
      label: 'A new dashboard',
      path: '',
      component: Dashboard,
    },
    {
      label: 'About this project',
      path: 'about',
      component: About,
    },
    // Ordering existing list pages
    {
      label: 'Blog',
      children: [
        { listKey: 'Post' },
        { listKey: 'PostCategory', label: 'Categories' },
        { listKey: 'Comment' },
      ],
    },
    {
      label: 'People',
      children: ['User'],
    },
  ],
};
```

### `isAccessAllowed`

This function takes the same arguments as a [shorthand imperative boolean](https://www.keystonejs.com/api/access-control#shorthand-imperative-boolean) access control. It must return either true or false.

> **Important:** If omitted, all users _with accounts_ will be able to access the Admin UI. The example below would restrict access to users with the `isAdmin` permission.

#### Usage

```js
new AdminUIApp({
  /*...config */
  isAccessAllowed: ({ authentication: { item: user, listKey: list } }) => !!user && !!user.isAdmin,
}),
```
