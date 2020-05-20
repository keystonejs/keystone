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
  /*...config */
});
```

## Config

| Option           | Type       | Default                         | Description                                                                                                                                       |
| ---------------- | ---------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `adapter`        | `Object`   | Required                        | The database storage adapter. See the [Adapter framework](https://keystonejs.com/keystonejs/keystone/lib/adapters/) docs for more details.        |
| `adapters`       | `Object`   | `undefined`                     | A list of named database adapters. Use the format `{ name: adapterObject }`.                                                                      |
| `appVersion`     | `Object`   | See [`appVersion`](#appversion) | Configure the application version and where it is made available.                                                                                 |
| `cookie`         | `Object`   | See: [`cookie`](#cookie)        | Cookie object used to configure the [express-session middleware](https://github.com/expressjs/session#cookie).                                    |
| `cookieSecret`   | `String`   | Required in production          | The secret used to sign session ID cookies. Should be long and unguessable.                                                                       |
| `defaultAccess`  | `Object`   | `undefined`                     | Default list, field, and custom schema access. See the [Access control API](https://www.keystonejs.com/api/access-control) docs for more details. |
| `defaultAdapter` | `String`   | `undefined`                     | The name of the database adapter to use by default if multiple are provided.                                                                      |
| `name`           | `String`   | `undefined`                     | The name of the project. Appears in the Admin UI.                                                                                                 |
| `onConnect`      | `Function` | `undefined`                     | Callback that executes once `keystone.connect()` complete. Takes no arguments.                                                                    |
| `queryLimits`    | `Object`   | `{}`                            | Configures global query limits                                                                                                                    |
| `sessionStore`   | `Object`   | `undefined`                     | A compatible Express session middleware.                                                                                                          |
| `schemaNames`    | `Array`    | `['public']`                    |                                                                                                                                                   |

### `appVersion`

Configure the application version, which can be surfaced via HTTP headers or GraphQL

The `version` can be any string value you choose to use for your system.
If `addVersionToHttpHeaders` is `true` then all requests will have the header `X-Keystone-App-Version` set.
The version can also be queried from the GraphQL API as `{ appVersion }`.
You can control whether this is exposed in your schema using `access`, which can be either a boolean, or an object with `schemaName` keys and boolean values.

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

## Methods

| Method                | Description                                                                  |
| --------------------- | ---------------------------------------------------------------------------- |
| `connect`             | Manually connect to Adapters.                                                |
| `createAuthStrategy`  | Creates a new authentication middleware instance.                            |
| `createItems`         | Add items to a `Keystone` list.                                              |
| `createList`          | Add a list to the `Keystone` schema.                                         |
| `disconnect`          | Disconnect from all adapters.                                                |
| `executeQuery`        | Run GraphQL queries and mutations directly against a `Keystone` instance.    |
| `extendGraphQLSchema` | Extend keystones generated schema with custom types, queries, and mutations. |
| `prepare`             | Manually prepare `Keystone` middlewares.                                     |

<!--

## Super secret methods

Hello curious user. Here are some undocumented methods you _can_ use.
Please note: We use these internally but provide no support or assurance if used in your projects.

| Method                | Description                                                                  |
| --------------------- | ---------------------------------------------------------------------------- |
| `dumpSchema`          | Dump schema to a file.                                                       |
| `getTypeDefs`         | Remove from user documentation?                                              |
| `getResolvers`        | Remove from user documentation?                                              |
| `registerSchema`      | Remove from user documentation?                                              |
| `createItem`          | Remove from user documentation?                                              |
| `getAdminMeta`        | Remove from user documentation?                                              |

-->

### `connect()`

Manually connect Keystone to the adapters. See [Custom Server](https://keystonejs.com/guides/custom-server).

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

### `createItems(items)`

Allows bulk creation of items. This method's primary use is intended for migration scripts, or initial seeding of databases.

```javascript
keystone.createItems({
  User: [{ name: 'Ticiana' }, { name: 'Lauren' }],
  Post: [
    {
      title: 'Hello World',
      author: { where: { name: 'Ticiana' } },
    },
  ],
});
```

The `author` field of the `Post` list would have the following configuration:

```javascript
keystone.createList('Post', {
  fields: {
    author: { type: Relationship, ref: 'User' },
  },
});
```

#### Config

| Option      | Type     | Description                                                                     |
| ----------- | -------- | ------------------------------------------------------------------------------- |
| `[listKey]` | `Object` | An object where keys are list keys, and values are an array of items to insert. |

_Note_: The format of the data must match the lists and fields setup with `keystone.createList()`

It is possible to create relationships at insertion using the Keystone query syntax.

E.g. `author: { where: { name: 'Ticiana' } }`

Upon insertion, Keystone will resolve the `{ where: { name: 'Ticiana' } }` query
against the `User` list, ultimately setting the `author` field to the ID of the
_first_ `User` that is found.

Note an error is thrown if no items match the query.

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

Disconnect all adapters.

### `executeQuery(queryString, config)`

Use this method to execute queries or mutations directly against a `Keystone` instance.

**Note:** When querying or mutating via `keystone.executeQuery`, there are differences to keep in mind:

- No access control checks are run (everything is set to `() => true`)
- The `context.req` object is set to `{}` (you can override this if necessary,
  see options below)
- Attempting to authenticate will throw errors (due to `req` being mocked)

Returns a Promise representing the result of the given query or mutation.

```javascript allowCopy=false showLanguage=false
keystone.executeQuery('query-string', {...});
```

#### queryString

A GraphQL query string. For example:

```graphql
query {
  allTodos {
    id
    name
  }
}
```

Can also be a mutation:

```graphql
mutation newTodo($name: String) {
  createTodo(name: $name) {
    id
  }
}
```

#### Config

| Option      | Type     | Default | Description                                                                                                               |
| ----------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| `context`   | `Object` | `{}`    | Override the default `context` object passed to the GraphQL engine. Useful for adding a `req` or setting the `schemaName` |
| `variables` | `Object` | `{}`    | The variables passed to the graphql query for the given queryString.                                                      |

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
  resolver: (obj, args, context, info, extra) => {},
}
```

For more information about the first four arguments, please see the [Apollo docs](https://www.apollographql.com/docs/graphql-tools/resolvers/#resolver-function-signature). The last argument `extra` is an object that contains the following properties:

| Name     | Description                                        |
| -------- | -------------------------------------------------- |
| `query`  | An executable helper function for running a query. |
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
