<!--[meta]
section: api
title: Server-side GraphQL Client
[meta]-->

# Server-Side GraphQL Client

A library for running server-side graphQL queries and mutations in Keystone. It replaces the `keystone.createItems` method with a set of utility functions to generate and execute graphQL queries.

It differs from running queries directly with `keystone.executeGraphQL` by abstracting away a lot of the GraphQL syntax. You provide these functions with a `listName` and the data execute the query and it returns items without the internal graphQL list names.

These functions use a server-side graphQL client that is based on same schema as your public API. You can also pass a `schemaName` to execute queries against a different schema including the private `internal` schema if you want to bypass access control checks.

You can pass `extraContext`, which is added to the apollo context object, allowing you to execute queries as an authenticated user or provide any additional context for custom resolvers.

These utilities can be used for a wide range of specific use-cases, some more common examples might include simple data seeding:

```js
const seedUsers = async usersData => {
  await createItems({ keystone, listName: 'User', items: usersData });
};
```

or fetching data inside hooks:

```js
// This example will copy data from a related field if set
keystone.createList('Page', {
  fields: {
    name: { type: Text },
    content: { type: Text },
    copy: { type: Relationship, ref: 'Page' },
  },
  hooks: {
    resolveInput: async ({ resolvedData }) => {
      // Whenever copy field is set fetch the related data
      const pageToCopy = resolvedData.copy
        ? await getItem({
            keystone,
            listName: 'Page',
            itemId: resolvedData.copy,
            returnFields: 'name, content',
          })
        : {};
      // resolve data from the copied item and unset the relationship
      return { ...resolvedData, ...pageToCopy, copy: undefined };
    },
  },
});
```

## API

To perform CRUD operations, use the following functions:

- `createItem`
- `createItems`
- `updateItem`
- `updateItems`
- `deleteItem`
- `deleteItems`

For custom queries use `runCustomQuery`.

> NOTE: All functions accepts an `config` object as an argument, and return a `Promise`.

### Shared Config Options

The following config options are common to all server-side graphQL functions.

| Properties     | Type       | Default    | Description                                                                                                  |
| -------------- | ---------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| `keystone`     | `Keystone` | (required) | Keystone instance.                                                                                           |
| `listName`     | `String`   | (required) | Keystone list name name.                                                                                     |
| `returnFields` | `String`   | `id`       | A graphQL fragment of fields to return. Must match the graphQL return type.                                  |
| `schemaName`   | `String`   | `public`   | Name of your GraphQL API schema. To override the access-control mechanism, provide `internal` as schemaName. |
| `extraContext` | `Object`   | `{}`       | Additional context option object that gets passed onto `keystone.executeGraphQL` method.                     |

### createItem

Allows you to create single item.

#### Usage

```js
const { createItem } = require('@keystonejs/server-side-graphql-client');

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: String },
  },
});

const addUser = async userInput => {
  const user = await createItem({
    keystone,
    listName: 'User',
    item: userInput,
    returnFields: `name, email`,
  });
  console.log(user); // { name: 'keystone user', email: 'keystone@test.com'}
};

addUser({ name: 'keystone user', email: 'keystone@test.com' });
```

#### Config

[Shared Config Options](#shared-config-options) apply to this function.

| Properties | Type                            | Default    | Description              |
| ---------- | ------------------------------- | ---------- | ------------------------ |
| `item`     | GraphQL `[listName]CreateInput` | (required) | The item to be inserted. |

### createItems

Allows bulk creation of items.

#### Usage

```js
const { createItems } = require('@keystonejs/server-side-graphql-client');

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: String },
  },
});

const dummyUsers = [
  {
    data: { name: 'user1', email: 'user1@test.com' },
    data: { name: 'user2', email: 'user2@test.com' },
  },
];

const addUsers = async () => {
  const users = await createItems({
    keystone,
    listName: 'User',
    items: dummyUsers,
    returnFields: `name`,
  });
  console.log(users); // [{name: `user2`}, {name: `user2`}]
};
addUsers();
```

#### Config

[Shared Config Options](#shared-config-options) apply to this function.

| Properties | Type                             | Default    | Description                                                                                    |
| ---------- | -------------------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| `items`    | GraphQL `[listName]sCreateInput` | (required) | The array of objects to be inserted.                                                           |
| `pageSize` | `Number`                         | 500        | The create mutation batch size. This is useful when you have large set of data to be inserted. |

### getItem

Retrieve single item by its id.

#### Usage

```js
const { getItem } = require('@keystonejs/server-side-graphql-client');

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: String },
  },
});

const getUser = async ({ itemId }) => {
  const user = await getItem({
    keystone,
    listName: 'User',
    itemId,
    returnFields: 'id, name',
  });
  console.log(user); // User 123: { id: '123', name: 'Aman' }
};
getUser({ itemId: '123' });
```

#### Config

[Shared Config Options](#shared-config-options) apply to this function.

| Properties | Type     | Default    | Description                           |
| ---------- | -------- | ---------- | ------------------------------------- |
| `itemId`   | `String` | (required) | The `id` of the item to be retrieved. |

### getItems

Retrieve multiple items. Use [where](https://www.keystonejs.com/guides/intro-to-graphql/#where) clause to filter results.

#### Usage

```js
const { getItems } = require('@keystonejs/server-side-graphql-client');

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: String },
  },
});

const getUsers = async () => {
  const allUsers = await getItems({ keystone, listName: 'User', returnFields: 'name' });
  const someUsers = await getItems({
    keystone,
    listName: 'User',
    returnFields: 'name',
    where: { name: 'user1' },
  });
  console.log(allUsers); // [{ name: 'user1' }, { name: 'user2' }];
  console.log(someUsers); // [{ name: 'user1' }];
};
getUsers();
```

#### Config

[Shared Config Options](#shared-config-options) apply to this function.

| Properties | Type                           | Default | Description                                                                                                |
| ---------- | ------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------- |
| `where`    | GraphQL `[listName]WhereInput` | `{}`    | Limit results to items matching [where clause](https://www.keystonejs.com/guides/intro-to-graphql/#where). |
| `pageSize` | `Number`                       | 500     | The query batch size. Useful when retrieving a large set of data.                                          |

### updateItem

Update single item.

#### Usage

```js
const { updateItem } = require('@keystonejs/server-side-graphql-client');

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: String },
  },
});

const updateUser = async updateUser => {
  const updatedUser = await updateItem({
    keystone,
    listName: 'User',
    item: updateUser,
    returnFields: 'name',
  });
  console.log(updatedUser); // { name: 'newName'}
};
updateUser({ id: 123, data: { name: 'newName' } });
```

#### Config

[Shared Config Options](#shared-config-options) apply to this function.

| Properties | Type                            | Default    | Description             |
| ---------- | ------------------------------- | ---------- | ----------------------- |
| `item`     | GraphQL `[listName]UpdateInput` | (required) | The item to be updated. |

### updateItems

Allow bulk updating of items.

#### Usage

```js
const { updateItems } =  require('@keystonejs/server-side-graphql-client')

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: String },
  },
});

const updateUsers = async (updateUser) => {
  const users = await updateItems({
    keystone,
    listName: 'User',
    items: [
      {id: '123', data: {name: 'newName1'},
      {id: '456', data: {name: 'newName2'}
    ],
    returnFields: 'name'
  });

  console.log(users); // [{name: 'newName1'}, {name: 'newName2'}]
}

updateUsers([
  {id: '123', data: {name: 'newName1'},
  {id: '456', data: {name: 'newName2'}
]);

```

#### Config

[Shared Config Options](#shared-config-options) apply to this function.

| Properties | Type                             | Default    | Description                   |
| ---------- | -------------------------------- | ---------- | ----------------------------- |
| `items`    | GraphQL `[listName]sUpdateInput` | (required) | Array of items to be updated. |

### deleteItem

Delete single item.

#### Usage

```js
const { deleteItem } = require('@keystonejs/server-side-graphql-client');

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: String },
  },
});

const deleteUser = async itemId => {
  const user = await deleteItem({ keystone, listName: 'User', itemId });
  console.log(user); // { id: '123' }
};
deleteUser('123');
```

#### Config

[Shared Config Options](#shared-config-options) apply to this function.

| Properties | Type     | Default    | Description                         |
| ---------- | -------- | ---------- | ----------------------------------- |
| `itemId`   | `String` | (required) | The `id` of the item to be deleted. |

### deleteItems

Allow bulk deleting of items.

#### Usage

```js
const { deleteItems } = require('@keystonejs/server-side-graphql-client');

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: String },
  },
});

const deletedUsers = async items => {
  const users = await deleteItems({ keystone, listName: 'User', items });
  console.log(users); // [{id: '123'}, {id: '456'}]
};
deletedUsers(['123', '456']);
```

#### Config

[Shared Config Options](#shared-config-options) apply to this function.

| Properties | Type       | Default    | Description                        |
| ---------- | ---------- | ---------- | ---------------------------------- |
| `itemId`   | `String[]` | (required) | Array of item `id`s to be deleted. |

### runCustomQuery

Allow executing a custom query.

#### Config

| Properties  | Type   | Default    | Description                                          |
| ----------- | ------ | ---------- | ---------------------------------------------------- |
| `variables` | Object | (required) | Object containing variables your custom query needs. |
