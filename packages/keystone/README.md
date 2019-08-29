<!--[meta]
section: api
title: Keystone
order: 1
[meta]-->

# keystone

## Methods

| Method                | Description                                                                  |
| --------------------- | ---------------------------------------------------------------------------- |
| `createList`          | Add a list to the Keystone schema.                                           |
| `extendGraphQLSchema` | Extend keystones generated schema with custom types, queries, and mutations. |
| `connect`             | Manually connect to Adapters.                                                |
| `prepare`             | Manually peapare Keystone middlewares.                                       |
| `createItems`         | Add items to a Keystone list.                                                |
| `disconnect`          | Disconnect from all adapters.                                                |

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

Registers a new list with Keystone and returns a Keystone list object.

| Option    | Type     | Default | Description                                                                        |
| --------- | -------- | ------- | ---------------------------------------------------------------------------------- |
| `listKey` | `String` | `null`  | The name of the list. This should be singular, E.g. 'User' not 'Users'.            |
| `config`  | `Object` | `{}`    | The list config. See the [createList API](/api/create-list) page for more details. |

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

It is possible to create relationships at insertion using the Keystone query syntax.

E.g. `author: { where: { name: 'Ticiana' } }`

Upon insertion, Keystone will resolve the `{ where: { name: 'Ticiana' } }` query
against the `User` list, ultimately setting the `author` field to the ID of the
_first_ `User` that is found.

Note an error is thrown if no items match the query.

## prepare(config)

Manually prepare middlewares.

### Usage

```javascript
keystone.prepare({
  apps,
  dev: process.env.NODE_ENV !== 'production',
});
```

### Config

| Option    | Type      | default | Description                                         |
| --------- | --------- | ------- | --------------------------------------------------- |
| `dev`     | `Boolean` | `false` | Sets the dev flag in Keystone's express middleware. |
| `apps`    | `Array`   | `[]`    | An array of 'Apps' which are express middleware.    |
| `distDir` | `String`  | `dist`  | The build directory for keystone.                   |

## connect()

Manually connect Keystone to the adapters.

### Usage

```javascript
keystone.connect();
```

_Note_: `keystone.connect()` is only required for custom servers. Most example projects use the `keystone start` command to start a server and automatically connect.

See: [Custom Server](guides/custom-server).

## disconnect()

Disconnect all adapters.
