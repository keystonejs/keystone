<!--[meta]
section: api
title: Keystone
order: 1
[meta]-->

# keystone

## Constructor

### Usage

```javascript
const { Keystone } = require('@keystonejs/keystone');

const keystone = new Keystone({
  /*...config */
});
```

### Config

| Option           | Type       | Default    | Description                                                                                                                                |
| ---------------- | ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`           | `String`   | `null`     | The name of the project. Appears in the Admin UI.                                                                                          |
| `adapter`        | `Object`   | Required   | The database storage adapter. See the [Adapter Framework](https://keystonejs.com/keystonejs/keystone/lib/adapters/) page for more details. |
| `adapters`       | `Object`   | `{}`       | A list of named database adapters. Use the format `{ name: adapterObject }`.                                                               |
| `defaultAdapter` | `String`   | `null`     | The name of the database adapter to use by default if multiple are provided.                                                               |
| `defaultAccess`  | `Object`   | `{}`       |                                                                                                                                            |
| `onConnect`      | `Function` | `null`     |                                                                                                                                            |
| `cookieSecret`   | `String`   | `qwerty`   |                                                                                                                                            |
| `cookieMaxAge`   | `Int`      | 30 days    |                                                                                                                                            |
| `secureCookies`  | `Boolean`  | Variable   | Defaults to true in production mode, false otherwise.                                                                                      |
| `sessionStore`   | `Object`   | `null`     | A compatible Express session middleware.                                                                                                   |
| `schemaNames`    | `Array`    | `[public]` |                                                                                                                                            |
| `queryLimits`    | `Object`   | `{}`       | Configures global query limits                                                                                                             |

### `sessionStore`

Sets the Express server's [session middleware](https://github.com/expressjs/session). This should be configured before deploying your app.

This example uses the [`connect-mongo`](https://github.com/jdesboeufs/connect-mongo) middleware, but you can use [any of the stores that work with `express session`](https://github.com/expressjs/session#compatible-session-stores).

#### Usage

```javascript
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);

const keystone = new Keystone({
  /* ...config */
  sessionStore: new MongoStore({ url: 'mongodb://localhost/my-app' }),
});
```

### `queryLimits`

Configures global query limits.

These should be used together with [list query limits](https://keystonejs.com/api/create-list#query-limits).

#### Usage

```javascript
const keystone = new Keystone({
  /* ...config */
  queryLimits: {
    maxTotalResults: 1000,
  },
});
```

- `maxTotalResults`: limit of the total results of all relationship subqueries

Note that `maxTotalResults` applies to the total results of all relationship queries separately, even if some are nested inside others.

## Methods

| Method                | Description                                                                  |
| --------------------- | ---------------------------------------------------------------------------- |
| `createList`          | Add a list to the `Keystone` schema.                                         |
| `extendGraphQLSchema` | Extend keystones generated schema with custom types, queries, and mutations. |
| `connect`             | Manually connect to Adapters.                                                |
| `prepare`             | Manually prepare `Keystone` middlewares.                                     |
| `createItems`         | Add items to a `Keystone` list.                                              |
| `disconnect`          | Disconnect from all adapters.                                                |
| `executeQuery`        | Run GraphQL queries and mutations directly against a `Keystone` instance.    |

<!--

## Super secret methods

Hello curious user. Here are some undocumented methods you _can_ use.
Please note: We use these internally but provide no support or assurance if used in your projects.

| Method                | Description                                                                  |
| --------------------- | ---------------------------------------------------------------------------- |
| `dumpSchema`          | Dump schema to a file.                                                       |
| `getTypeDefs`         | Remove from user documentation?                                              |
| `registerSchema`      | Remove from user documentation?                                              |
| `getAdminSchema`      | Remove from user documentation?                                              |
| `getAccessContext`    | Remove from user documentation?                                              |
| `createItem`          | Remove from user documentation?                                              |
| `getAdminMeta`        | Remove from user documentation?                                              |

-->

## createList(listKey, config)

### Usage

```javascript
keystone.createList('Posts', {
  /*...config */
});
```

### Config

Registers a new list with KeystoneJS and returns a `Keystone` list object.

| Option    | Type     | Default | Description                                                                                              |
| --------- | -------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `listKey` | `String` | `null`  | The name of the list. This should be singular, E.g. 'User' not 'Users'.                                  |
| `config`  | `Object` | `{}`    | The list config. See the [createList API](https://keystonejs.com/api/create-list) page for more details. |

## extendGraphQLSchema(config)

Extends keystones generated schema with custom types, queries, and mutations.

### Usage

```javascript
keystone.extendGraphQLSchema({
  types: ['type FooBar { foo: Int, bar: Float }'],
  queries: [
    {
      schema: 'double(x: Int): Int',
      resolver: (_, { x }) => 2 * x,
    },
  ],
  mutations: [
    {
      schema: 'double(x: Int): Int',
      resolver: (_, { x }) => 2 * x,
    },
  ],
});
```

### Config

| Option    | Type    | Description                                         |
| --------- | ------- | --------------------------------------------------- |
| types     | `array` | A list of strings defining graphQL types.           |
| queries   | `array` | A list of objects of the form { schema, resolver }. |
| mutations | `array` | A list of objects of the form { schema, resolver }. |

The `schema` for both queries and mutations should be a string defining the graphQL schema element for the query/mutation, e.g.

```javascript
{
  schema: 'getBestPosts(author: ID!): [Post]';
}
```

The `resolver` for both queries and mutations should be a resolver function with the signature `(obj, args, context, info)`. See the [Apollo docs](https://www.apollographql.com/docs/graphql-tools/resolvers/#resolver-function-signature) for more details.

## createItems(items)

Allows bulk creation of items. This method's primary use is intended for migration scripts, or initial seeding of databases.

### Usage

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

### Config

| Option      | Type     | Description                                                                     |
| ----------- | -------- | ------------------------------------------------------------------------------- |
| `[listKey]` | `Object` | An object where keys are list keys, and values are an array of items to insert. |

_Note_: The format of the data must match the lists and fields setup with `keystone.createList()`

It is possible to create relationships at insertion using the KeystoneJS query syntax.

E.g. `author: { where: { name: 'Ticiana' } }`

Upon insertion, KeystoneJS will resolve the `{ where: { name: 'Ticiana' } }` query
against the `User` list, ultimately setting the `author` field to the ID of the
_first_ `User` that is found.

Note an error is thrown if no items match the query.

## prepare(config)

Manually prepare middlewares. Returns a promise representing the processed middlewares. They are available as an array through the `middlewares` property of the returned object.

### Usage

```javascript
const { middlewares } = await keystone.prepare({
  apps,
  dev: process.env.NODE_ENV !== 'production',
});
```

### Config

| Option    | Type      | default | Description                                          |
| --------- | --------- | ------- | ---------------------------------------------------- |
| `dev`     | `Boolean` | `false` | Sets the dev flag in KeystoneJS' express middleware. |
| `apps`    | `Array`   | `[]`    | An array of 'Apps' which are express middleware.     |
| `distDir` | `String`  | `dist`  | The build directory for keystone.                    |

## connect()

Manually connect KeystoneJS to the adapters.

### Usage

```javascript
keystone.connect();
```

_Note_: `keystone.connect()` is only required for custom servers. Most example projects use the `keystone start` command to start a server and automatically connect.

See: [Custom Server](https://keystonejs.com/guides/custom-server).

## disconnect()

Disconnect all adapters.

## executeQuery(queryString, config)

Use this method to execute queries or mutations directly against a `Keystone` instance.

**Note:** When querying or mutating via `keystone.executeQuery`, there are differences to keep in mind:

- No access control checks are run (everything is set to `() => true`)
- The `context.req` object is set to `{}` (you can override this if necessary,
  see options below)
- Attempting to authenticate will throw errors (due to `req` being mocked)

Returns a Promise representing the result of the given query or mutation.

### Usage

```javascript
keystone.executeQuery(queryString, config);
```

### queryString

A graphQL query string. For example:

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

### Config

| Option      | Type     | Default | Description                                                                                                               |
| ----------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| `variables` | `Object` | `{}`    | The variables passed to the graphql query for the given queryString.                                                      |
| `context`   | `Object` | `{}`    | Override the default `context` object passed to the GraphQL engine. Useful for adding a `req` or setting the `schemaName` |
