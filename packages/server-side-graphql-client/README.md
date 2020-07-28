<!--[meta]
section: api
title: Server-side graphQL client
[meta]-->

# Server-side graphQL client

This library provides wrapper functions around `keystone.executeGraphQL` to make it easier to run server-side queries and mutations without needing to write boilerplate GraphQL.

Creating a new `User` item would be written as follows using `keystone.executeGraphQL`:

```js
const { data, errors } = await keystone.executeGraphQL({
  query: `mutation ($item: createUserInput){
    createUser(data: $item) {
      id
      name
    }
  }`,
  variables: { item: { name: 'Alice' } },
});
const user = data.createUserInput;
```

Using `@keystonejs/server-side-graphql-client` we can replace this with

```js
const { createItem } = require('@keystonejs/server-side-graphql-client');

const user = await createItem({
  keystone,
  listName: 'User',
  item: { name: 'Alice' },
  returnFields: `id name`,
});
```

There are three key differences between `keystone.executeGraphQL` and `createItem` (and other functions from this package):

1. If there is an error, `createItem` will be thrown as an exception, rather than providing the error as a return value.
2. `createItem` runs with _access control disabled_. This is suitable for use cases such as seeding data or other server side scripts where the query is triggered by the system, rather than a specific user. This can be controlled with the `context` option.
3. All queries are internally paginated and all mutations are internally chunked. This can be controlled with the `pageSize` option.

### Use cases

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

- [`createItem`](#createitem)
- [`createItems`](#createitems)
- [`updateItem`](#updateitem)
- [`updateItems`](#updateitems)
- [`deleteItem`](#deleteitem)
- [`deleteItems`](#deleteitems)

For custom queries use [`runCustomQuery`](#runcustomquery).

> NOTE: All functions accept a config object as an argument, and return a `Promise`.

### Shared Config Options

The following config options are common to all server-side graphQL functions.

| Properties     | Type       | Default    | Description                                                                                                                                                                                                         |
| -------------- | ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keystone`     | `Keystone` | (required) | Keystone instance.                                                                                                                                                                                                  |
| `listName`     | `String`   | (required) | Keystone list name.                                                                                                                                                                                                 |
| `returnFields` | `String`   | `id`       | A graphQL fragment of fields to return. Must match the graphQL return type.                                                                                                                                         |
| `context`      | `Object`   | N/A        | An Apollo [`context` object](https://www.apollographql.com/docs/apollo-server/data/resolvers/#the-context-argument). See the [server side graphQL docs](/docs/discussions/server-side-graphql.md) for more details. |

### `createItem`

Create a single item.

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

| Properties | Type                            | Default    | Description             |
| ---------- | ------------------------------- | ---------- | ----------------------- |
| `item`     | GraphQL `[listName]CreateInput` | (required) | The item to be created. |

### `createItems`

Create multiple items.

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
| `items`    | GraphQL `[listName]sCreateInput` | (required) | The array of objects to be created.                                                            |
| `pageSize` | `Number`                         | 500        | The create mutation batch size. This is useful when you have large set of data to be inserted. |

### `getItem`

Retrieve a single item by its ID.

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

### `getItems`

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

### `updateItem`

Update a single item.

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
updateUser({ id: '123', data: { name: 'newName' } });
```

#### Config

[Shared Config Options](#shared-config-options) apply to this function.

| Properties | Type                            | Default    | Description             |
| ---------- | ------------------------------- | ---------- | ----------------------- |
| `item`     | GraphQL `[listName]UpdateInput` | (required) | The item to be updated. |

### `updateItems`

Update multiple items.

#### Usage

```js
const { updateItems } =  require('@keystonejs/server-side-graphql-client')

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: String },
  },
});

const updateUsers = async (updateUsers) => {
  const users = await updateItems({
    keystone,
    listName: 'User',
    items: updateUsers,
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

### `deleteItem`

Delete a single item.

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

### `deleteItems`

Delete multiple items.

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

### `runCustomQuery`

Execute a custom query.

#### Config

| Properties  | Type     | Default    | Description                                                                                                                                                                                                         |
| ----------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keystone`  | Object   | (required) | Keystone instance.                                                                                                                                                                                                  |
| `query`     | String   | (required) | The GraphQL query to execute.                                                                                                                                                                                       |
| `variables` | Object   | (required) | Object containing variables your custom query needs.                                                                                                                                                                |
| `context`   | `Object` | N/A        | An Apollo [`context` object](https://www.apollographql.com/docs/apollo-server/data/resolvers/#the-context-argument). See the [server side graphQL docs](/docs/discussions/server-side-graphql.md) for more details. |
