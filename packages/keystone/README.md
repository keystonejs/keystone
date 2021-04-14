<!--[meta]
section: api
title: Keystone class
order: 1
[meta]-->

# Keystone class

## Usage

```javascript
const { Keystone } = require('@keystone-next/keystone-legacy');

const keystone = new Keystone({
  adapter,
  onConnect,
  queryLimits,
  schemaNames,
});
```

#### `secure`

A secure cookie is only sent to the server with an encrypted request over the HTTPS protocol. If `secure` is set to true (as is the default with a **production** build) for a KeystoneJS project running on a non-HTTPS server (such as localhost), you will **not** be able to log in. In that case, be sure you set `secure` to false. This does not affect development builds since this value is already false.

You can read more about secure cookies on the [MDN web docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#Secure_and_HttpOnly_cookies).

#### Usage

```javascript
const keystone = new Keystone({
  /* ...config */
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Default to true in production
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    sameSite: false,
  },
});
```

### `onConnect`

_**Default:**_ `undefined`

Callback function that executes once `keystone.connect()` is complete. Takes no arguments.

### `queryLimits`

Configures global query limits.

These should be used together with [list query limits](https://keystonejs.com/api/create-list#query-limits).

```javascript
const keystone = new Keystone({
  queryLimits: {
    maxTotalResults: 1000,
  },
});
```

- `maxTotalResults`: limit of the total results of all relationship subqueries

Note that `maxTotalResults` applies to the total results of all relationship queries separately, even if some are nested inside others.

### `schemaNames`

_**Default:**_ `['public']`

## Methods

| Method          | Description                                                              |
| --------------- | ------------------------------------------------------------------------ |
| `connect`       | Manually connect to Adapter.                                             |
| `createList`    | Add a list to the `Keystone` schema.                                     |
| `disconnect`    | Disconnect from the adapter.                                             |
| `prepare`       | Manually prepare `Keystone` middlewares.                                 |
| `createContext` | Create a `context` object that can be used with `context.graphql.raw()`. |

<!--
## Super secret methods

Hello curious user. Here are some undocumented methods you _can_ use.
Please note: We use these internally but provide no support or assurance if used in your projects.

| Method                | Description                                                                  |
| --------------------- | ---------------------------------------------------------------------------- |
| `getTypeDefs`         | Remove from user documentation?                                              |
| `getResolvers`        | Remove from user documentation?                                              |
| `getAdminMeta`        | Remove from user documentation?                                              |
-->

### `connect()`

Manually connect Keystone to the adapter. See [Custom Server](https://keystonejs.com/guides/custom-server).

```javascript allowCopy=false showLanguage=false
keystone.connect();
```

> **Note:** `keystone.connect()` is only required for custom servers. Most example projects use the `keystone start` command to start a server and automatically connect.

### `createList(listKey, config)`

Registers a new list with Keystone and returns a `Keystone` list object. See:

- [Adding lists tutorial](/docs/tutorials/add-lists.md)
- [Data modelling guide](/docs/guides/schema.md)

```javascript allowCopy=false showLanguage=false
keystone.createList('Posts', {...});
```

#### Config

| Option    | Type     | Default | Description                                                                                 |
| --------- | -------- | ------- | ------------------------------------------------------------------------------------------- |
| `listKey` | `String` | `null`  | The name of the list. This should be singular, E.g. 'User' not 'Users'.                     |
| `config`  | `Object` | `{}`    | The list config. See the [create list API docs](/docs/api/create-list.md) for more details. |

### `disconnect()`

Disconnect the adapter.

#### Config

| Option    | Type    | Description                                                                                    |
| --------- | ------- | ---------------------------------------------------------------------------------------------- |
| types     | `array` | A list of objects of the form `{ type, access }` where the type string defines a GraphQL type. |
| queries   | `array` | A list of objects of the form `{ schema, resolver, access }`.                                  |
| mutations | `array` | A list of objects of the form `{ schema, resolver, access }`.                                  |

- The `schema` for both queries and mutations should be a string defining the GraphQL schema element for the query/mutation, e.g.

```javascript
{
  schema: 'getBestPosts(author: ID!): [Post]',
}
```

- The `resolver` for both queries and mutations should be a resolver function with following signature:

```javascript
{
  resolver: (parent, args, context, info, extra) => {},
}
```

For more information about the first four arguments, please see the [Apollo docs](https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments). The last argument `extra` is an object that contains the following property:

| Name     | Description                                        |
| -------- | -------------------------------------------------- |
| `access` | Access control information about the current user. |

- The `access` argument for `types`, `queries`, and `mutations` are all either boolean values which are used at schema generation time to include or exclude the item from the schema, or a function which must return boolean.
- See the [Access control API](https://www.keystonejs.com/api/access-control#custom-schema-access-control) docs for more details.

#### Config

| Option        | Type      | default                               | Description                                                                                                         |
| ------------- | --------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `apps`        | `Array`   | `[]`                                  | An array of 'Apps' which are express middleware.                                                                    |
| `cors`        | `Object`  | `{ origin: true, credentials: true }` | CORS options passed to the [`cors` npm module](https://www.npmjs.com/package/cors)                                  |
| `dev`         | `Boolean` | `false`                               | Sets the dev flag in Keystone' express middleware.                                                                  |
| `distDir`     | `String`  | `dist`                                | The build directory for keystone.                                                                                   |
| `pinoOptions` | `Object`  | `undefined`                           | Logging options passed to the [`express-pino-logger` npm module](https://www.npmjs.com/package/express-pino-logger) |

### `createContext({ schemaName, authentication, skipAccessControl })`

Create a `context` object that can be used with `context.graphql.raw()`.

#### Usage

```javascript
const { gql } = require('apollo-server-express');

// Create a context which can execute GraphQL operations with no access control
const context = keystone.createContext().sudo()

// Execute a GraphQL operation with no access control
const { data, errors } = await context.graphql.raw({ context, query: gql` ... `, variables: { ... }})
```

#### Config

| Option              | Type      | default  | Description                                                                                  |
| ------------------- | --------- | -------- | -------------------------------------------------------------------------------------------- |
| `schemaName`        | `String`  | `public` | The name of the GraphQL schema to execute against.                                           |
| `authentication`    | `Object`  | `{}`     | `{ item: { id }, listAuthKey: "" }`. Specifies the item to be used in access control checks. |
| `skipAccessControl` | `Boolean` | `false`  | Set to `true` to skip all access control checks.                                             |

#### Usage

```javascript
const { gql } = require('apollo-server-express');

// Create a context which can execute GraphQL operations with no access control
const context = keystone.createContext().sudo()

// Execute a GraphQL operation with no access control
const { data, errors } = await context.graphql.raw({ query: gql` ... `, variables: { ... }})
```

#### Config

| Option      | Type     | default                    | Description                                             |
| ----------- | -------- | -------------------------- | ------------------------------------------------------- |
| `context`   | `Array`  | `keystone.createContext()` | A `context` object to be used by the GraphQL resolvers. |
| `query`     | `Object` | `undefined`                | The GraphQL operation to execute.                       |
| `variables` | `Object` | `undefined`                | The variables to be passed to the GraphQL operation.    |
