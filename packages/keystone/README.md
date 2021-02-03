<!--[meta]
section: api
title: Keystone class
order: 1
[meta]-->

# Keystone class

## Usage

```javascript
const { Keystone } = require('@keystonejs/keystone');

const keystone = new Keystone({
  adapter,
  appVersion,
  cookie,
  cookieSecret,
  defaultAccess,
  onConnect,
  queryLimits,
  sessionStore,
  schemaNames,
});
```

### `appVersion`

Configure the application version, which can be surfaced via HTTP headers or GraphQL.

The `version` can be any string value you choose to use for your system. If `addVersionToHttpHeaders` is `true` then all requests will have the header `X-Keystone-App-Version` set. The version can also be queried from the GraphQL API as `{ appVersion }`. You can control whether this is exposed in your schema using `access`, which can be either a boolean, or an object with `schemaName` keys and boolean values.

```javascript
const keystone = new Keystone({
  appVersion: {
    version: '1.0.0',
    addVersionToHttpHeaders: true,
    access: true,
  },
});
```

#### Why don't we just use `access` to control the HTTP header?

> We want to attach the HTTP header at the very top of the middleware stack, so if something gets rejected we can at least be sure of the system version that did the rejecting. This happens well before we have worked out which schema the person is trying to access, and therefore our access control isn’t ready to be used. Also, the access control that we set up is all about controlling access to the GraphQL API, and HTTP headers are a Different Thing, so even if it was technically possible to use the same mechanism, it really makes sense to decouple those two things.

### `cookie`

_**Default:**_ see Usage.

A description of the cookie properties is included in the [express-session documentation](https://github.com/expressjs/session#cookie).

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

### `cookieSecret`

The secret used to sign session ID cookies. In production mode (`process.env.NODE_ENV === 'production'`) this option is required. In development mode, if undefined, a random `cookieSecret` will be generated each time Keystone starts (this will cause sessions to be reset between restarts).

### `defaultAccess`

_**Default:**_

```js
{
  list: true,
  field: true,
  custom: true
}
```

Default list and field access. See the [Access Control](https://www.keystonejs.com/api/access-control#defaults) page for more details.

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

### `sessionStore`

Sets the Express server's [session middleware](https://github.com/expressjs/session). This should be configured before deploying your app.

This example uses the [`connect-mongo`](https://github.com/jdesboeufs/connect-mongo) middleware, but you can use [any of the stores that work with `express session`](https://github.com/expressjs/session#compatible-session-stores).

```javascript
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);

const keystone = new Keystone({
  sessionStore: new MongoStore({ url: 'mongodb://localhost/my-app' }),
});
```

### `schemaNames`

_**Default:**_ `['public']`

## Methods

| Method                | Description                                                                  |
| --------------------- | ---------------------------------------------------------------------------- |
| `connect`             | Manually connect to Adapter.                                                 |
| `createAuthStrategy`  | Creates a new authentication middleware instance.                            |
| `createList`          | Add a list to the `Keystone` schema.                                         |
| `disconnect`          | Disconnect from the adapter.                                                 |
| `extendGraphQLSchema` | Extend keystones generated schema with custom types, queries, and mutations. |
| `prepare`             | Manually prepare `Keystone` middlewares.                                     |
| `createContext`       | Create a `context` object that can be used with `executeGraphQL()`.          |
| `executeGraphQL`      | Execute a server-side GraphQL operation within the given context.            |

<!--
## Super secret methods

Hello curious user. Here are some undocumented methods you _can_ use.
Please note: We use these internally but provide no support or assurance if used in your projects.

| Method                | Description                                                                  |
| --------------------- | ---------------------------------------------------------------------------- |
| `dumpSchema`          | Dump schema to a string.                                                     |
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

### `createAuthStrategy(config)`

Creates a new authentication middleware instance. See:

- [Authentication guide](https://www.keystonejs.com/guides/authentication)
- [Authentication API docs](https://www.keystonejs.com/api/authentication)

```javascript allowCopy=false showLanguage=false
const authStrategy = keystone.createAuthStrategy({...});
```

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

### `extendGraphQLSchema(config)`

Extends keystones generated schema with custom types, queries, and mutations.

```javascript
keystone.extendGraphQLSchema({
  types: [{ type: 'type MyType { original: Int, double: Float }' }],
  queries: [
    {
      schema: 'double(x: Int): MyType',
      resolver: (_, { x }) => ({ original: x, double: 2.0 * x }),
    },
  ],
  mutations: [
    {
      schema: 'triple(x: Int): Int',
      resolver: (_, { x }) => 3 * x,
    },
  ],
});
```

See the [Custom schema guide](/docs/guides/custom-schema.md) for more information on utilizing custom schema.

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

### `prepare(config)`

Manually prepare middlewares. Returns a promise representing the processed middlewares. They are available as an array through the `middlewares` property of the returned object.

#### Usage

```javascript
const { middlewares } = await keystone.prepare({
  apps,
  dev: process.env.NODE_ENV !== 'production',
});
```

#### Config

| Option        | Type      | default                               | Description                                                                                                         |
| ------------- | --------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `apps`        | `Array`   | `[]`                                  | An array of 'Apps' which are express middleware.                                                                    |
| `cors`        | `Object`  | `{ origin: true, credentials: true }` | CORS options passed to the [`cors` npm module](https://www.npmjs.com/package/cors)                                  |
| `dev`         | `Boolean` | `false`                               | Sets the dev flag in Keystone' express middleware.                                                                  |
| `distDir`     | `String`  | `dist`                                | The build directory for keystone.                                                                                   |
| `pinoOptions` | `Object`  | `undefined`                           | Logging options passed to the [`express-pino-logger` npm module](https://www.npmjs.com/package/express-pino-logger) |

### `createContext({ schemaName, authentication, skipAccessControl })`

Create a `context` object that can be used with `executeGraphQL()`.

#### Usage

```javascript
const { gql } = require('apollo-server-express');

// Create a context which can execute GraphQL operations with no access control
const context = keystone.createContext({ skipAccessControl: true })

// Execute a GraphQL operation with no access control
const { data, errors } = await keystone.executeGraphQL({ context, query: gql` ... `, variables: { ... }})
```

#### Config

| Option              | Type      | default  | Description                                                                                  |
| ------------------- | --------- | -------- | -------------------------------------------------------------------------------------------- |
| `schemaName`        | `String`  | `public` | The name of the GraphQL schema to execute against.                                           |
| `authentication`    | `Object`  | `{}`     | `{ item: { id }, listAuthKey: "" }`. Specifies the item to be used in access control checks. |
| `skipAccessControl` | `Boolean` | `false`  | Set to `true` to skip all access control checks.                                             |

### `executeGraphQL({ context, query, variables })`

Execute a server-side GraphQL query within the given context.

#### Usage

```javascript
const { gql } = require('apollo-server-express');

// Create a context which can execute GraphQL operations with no access control
const context = keystone.createContext({ skipAccessControl: true })

// Execute a GraphQL operation with no access control
const { data, errors } = await keystone.executeGraphQL({ context, query: gql` ... `, variables: { ... }})
```

#### Config

| Option      | Type     | default                    | Description                                             |
| ----------- | -------- | -------------------------- | ------------------------------------------------------- |
| `context`   | `Array`  | `keystone.createContext()` | A `context` object to be used by the GraphQL resolvers. |
| `query`     | `Object` | `undefined`                | The GraphQL operation to execute.                       |
| `variables` | `Object` | `undefined`                | The variables to be passed to the GraphQL operation.    |
