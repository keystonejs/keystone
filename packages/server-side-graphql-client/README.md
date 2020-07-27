<!--[meta]
section: api
title: Server-side-graphql-client
[meta]-->

# Server-Side-GraphQL-Client

This package is a library for running queries and mutations against a Keystone system using functional-programming paradigm.

The key points are: 

- It's a client for executing GraphQL queries against your database in the server. 
- Technically it's a thin wrapper around `Keystone.executeGraphQL` method, which abstracts the process of building GraphQL queries.
- It adheres to the philosophy of performing CRUD operations using single standard API which keystone provides out of the box. 
- Provides `runCustomQuery` function to execute custom GraphQL queries. 
- Respects your access-controls. In the scenarios where you want to manipulate data without altering your access-control, it provides an escape hatch by using an internal GraphQL schema.

```js
// To insert data for the following Keystone list:
keystone.createList('User', {
    fields: {
      name: { type: Text },
      email: { type: String },
    },
  });

const { createItems } =  require('@keystonejs/server-side-graphql-client')

// Seed initial data while setting up keystone app
const dummyUsers = [{data: {name: 'keystone user', email: 'keystone@test.com'}}];

// Inside your async function 
await createItems({keystone, listName: 'User', items: dummyUsers, schemaName: 'schema name' })
```


## API
To perform CRUD operations, you can use the following functions to interact with your database.

- createItem
- createItems
- updateItem,
- updateItems,
- deleteItem,
- deleteItems,
- runCustomQuery

> NOTE: All functions accepts an `config` object as an argument, and returns a `Promise`.

### createItem

Allows you to create single item. 

#### Usage
```js
// Keystone list:
keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: String },
  },
});

const { createItem } =  require('@keystonejs/server-side-graphql-client')

const dummyUser = {name: 'keystone user', email: 'keystone@test.com'}}

// Inside your async function 
const { createUser } = await createItem({keystone, listName: 'User', item: dummyUser, returnFields: `name, email`, schemaName: 'schema name' })

console.log(createUser); // { name: 'keystone user', email: 'keystone@test.com'}
```

#### Config

| Properties   | Type           | Default    | Description                                                   |
| -------- | -------------- | ---------- | ----------------------------------------------------------------- |
| `keystone`   | `Keystone` | (required) | A keystone instance used to set up the app.                       |
| `listName`   | `String`       | (required) | The keystone list name.                                                |
| `item` | `{[fieldName: String]: any}`       | (required)       |   The object to be inserted.       |
| `returnFields` | `String`       | `id`       | Extract specific data fields from `create` mutation. Use `comma` or `space` separated names of fields for extracting multiple fields.|
| `schemaName` | `String`       | `public`       | The name of your GraphQL API schema. To override the access-control mechanism, provide `internal` as schemaName. This will set all access-control to `true`.|
| `extraContext` | `Object`       | `{}`       | The additional context option object that gets passed onto `keystone.executeGraphQL` method.|


### createItems

Allows bulk creation of items.

#### Usage

```js
// To insert data for the following Keystone list:
keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: String },
  },
});

const { createItems } =  require('@keystonejs/server-side-graphql-client')

const dummyUsers = [{data: {name: 'user1', email: 'user1@test.com'}, data: { name: 'user2', email: 'user2@test.com'}}];

// Inside your async function 
const { createUsers } = await createItems({keystone, listName: 'User', items: dummyUsers, returnFields: `name`, schemaName: 'schema name' })

console.log(createUsers); // [{name: `user2`}, {name: `user2`}]
```

#### Config

| Properties   | Type           | Default    | Description                                                   |
| -------- | -------------- | ---------- | ----------------------------------------------------------------- |
| `keystone`   | `Keystone` | (required) | A keystone instance used to set up the app.                       |
| `listName`   | `String`       | (required) | The keystone list name.                                                |
| `items` | `{data: {[fieldNamL: String]: any}}[]`       | (required)       |   The array of objects to be inserted.       |
| `pageSize` | `Number`       | 500       |  The create mutation batch size. This is useful when you have large set of data to be inserted.|
| `returnFields` | `String`       | `id`       | Extract specific data fields from `create` mutation. Use `comma` or `space` separated names of fields for extracting multiple fields.|
| `schemaName` | `String`       | `public`       | The name of your GraphQL API schema. To override the access-control mechanism, provide `internal` as schemaName. This will set all access-control to `true`|
| `extraContext` | `Object`       | `{}`       | The additional context option object that gets passed onto `keystone.executeGraphQL` method.|


### getItemById

Retrieve single item by its id. 

#### Usage
```js
 // Keystone list: 
 keystone.createList('User', {
   fields: {
     name: { type: Text },
     email: { type: String },
   },
 });

const { getItemById } =  require('@keystonejs/server-side-graphql-client')


// Inside your async function
// For retrieving a user with id: `123`
const user = await getItemById({keystone, listName: 'User', itemId: '123', schemaName: 'schema name' })

console.log(user); // { User: { id: '123'} }
```

#### Config


| Properties   | Type           | Default    | Description                                                   |
| -------- | -------------- | ---------- | ----------------------------------------------------------------- |
| `keystone`   | `Keystone` | (required) | A keystone instance used to set up the app.                       |
| `listName`   | `String`       | (required) | The keystone list name.                                                |
| `itemId` | `String`       | (required)       | The `id` of the item to be retrieved.       |
| `returnFields` | `String`       | `id`       | Extract specific data fields from query response. Use `comma` separated names of fields for extracting multiple fields.|
| `schemaName` | `String`       | `public`       | The name of your GraphQL API schema. To override the access-control mechanism, provide `internal` as schemaName. This will set all access-control to `true`|
| `extraContext` | `Object`       | `{}`       | The additional context option object that gets passed onto `keystone.executeGraphQL` method.|


### getItems

Retrieve multiple items. Use [where](https://www.keystonejs.com/guides/intro-to-graphql/#where) clause to filter results.

#### Usage
```js
// Keystone list: 
keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: String },
  },
});

const { getItems } =  require('@keystonejs/server-side-graphql-client');

// Inside your async function
// Retrieve all 'User' items
const allUsers = await getItems({keystone, listName: 'User', returnFields: 'name', schemaName: 'schema name' });
// Retrieving all users with name: 'user1'
const allUsersWhere = await getItems({keystone, listName: 'User', returnFields: 'name', schemaName: 'schema name', where: {name: 'user1'}  });

console.log(allUsers); // [{name: 'user1'}, {name: 'user2'}]
console.log(allUsersWhere); // [{name: 'user1'}]
```

#### Config


| Properties   | Type           | Default    | Description                                                   |
| -------- | -------------- | ---------- | ----------------------------------------------------------------- |
| `keystone`   | `Keystone` | (required) | A keystone instance used to set up the app.                       |
| `listName`   | `String`       | (required) | The keystone list name.                                                |
| `where`   | `Object`       | `{}` | Limit results to items matching the where clause. [Where](https://www.keystonejs.com/guides/intro-to-graphql/#where) clauses are used to query fields in a keystone list before retrieving data.|
| `pageSize` | `Number`       | 500       |  The query batch size. This is useful when you have large set of data to be retrieved.|
| `returnFields` | `String`       | `id`       | Extract specific data fields from query response. Use `comma` separated names of fields for extracting multiple fields.|
| `schemaName` | `String`       | `public`       | The name of your GraphQL API schema. To override the access-control mechanism, provide `internal` as schemaName. This will set all access-control to `true`|
| `extraContext` | `Object`       | `{}`       | The additional context option object that gets passed onto `keystone.executeGraphQL` method.|


### updateItem

Update single item. 

#### Usage
```js
// Keystone list: 
keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: String },
  },
});

// Initial user item : {id: '123', name: 'user1'}

const { getItemById, updateItem } =  require('@keystonejs/server-side-graphql-client')

// Inside your async function
// Update user name to 'newName'
await updateItem({keystone, listName: 'User', item: {id: 123, data: {name: 'newName'}}, returnFields: 'name', schemaName: 'schema name' })

// Retrieving updated user with id: 123
const user = await getItemById({keystone, listName: 'User', itemId: '123', returnFields: 'name', schemaName: 'schema name' })

console.log(user); // { User: { name: 'userName'} }
```

#### Config


| Properties   | Type           | Default    | Description                                                   |
| -------- | -------------- | ---------- | ----------------------------------------------------------------- |
| `keystone`   | `Keystone` | (required) | A keystone instance used to set up the app.                       |
| `listName`   | `String`       | (required) | The keystone list name.                                                |
| `item` | `{id: String, data: {[fieldNameL: String]: any}}`       | (required)| The item to be updated.|
| `returnFields` | `String`       | `id`       | Extract specific data fields from update mutation. Use `comma` separated names of fields for extracting multiple fields.|
| `schemaName` | `String`       | `public`       | The name of your GraphQL API schema. To override the access-control mechanism, provide `internal` as schemaName. This will set all access-control to `true`|
| `extraContext` | `Object`       | `{}`       | The additional context option object that gets passed onto `keystone.executeGraphQL` method.|



### updateItems(options)

Allow bulk updating of items.

#### Usage
```js
// Keystone list: 
keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: String },
  },
});

// Initial user items : [{id: '123', name: 'user1'}, {id: '456', name: 'user2'}]
const { updateItems, getItems } =  require('@keystonejs/server-side-graphql-client')

// Inside your async function
// Update multiple users 
await updateItems({keystone, listName: 'User', items: [{id: '123', data: {name: 'newName1'}, {id: '456', data: {name: 'newName2'}}}, returnFields: 'name', schemaName: 'schema name' });

// Retrieve all users
const allUsers = await getItems({keystone, listName: 'User', returnFields: 'name', schemaName: 'schema name' });

console.log(allUsers); // [{name: 'newName1'}, {name: 'newName2'}]
```
#### Config


| Properties   | Type           | Default    | Description                                                   |
| -------- | -------------- | ---------- | ----------------------------------------------------------------- |
| `keystone`   | `Keystone` | (required) | A keystone instance used to set up the app.                       |
| `listName`   | `String`       | (required) | The keystone list name.                                                |
| `items` | `{id: String, data: {[fieldName: String]: any}}[]`       | (required)| The array of items to be updated.|
| `returnFields` | `String`       | `id`       | Extract specific data fields from update mutation. Use `comma` separated names of fields for extracting multiple fields.|
| `schemaName` | `String`       | `public`       | The name of your GraphQL API schema. To override the access-control mechanism, provide `internal` as schemaName. This will set all access-control to `true`|
| `extraContext` | `Object`       | `{}`       | The additional context option object that gets passed onto `keystone.executeGraphQL` method.|



### deleteItem

Delete single item. 

#### Usage
```js
// Keystone list: 
keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: String },
  },
});

const { deleteItem } =  require('@keystonejs/server-side-graphql-client');

// Inside your async function
// Delete a user with id: `123`
const user = await deleteItem({keystone, listName: 'User', itemId: '123', schemaName: 'schema name' });

console.log(user); // {deleteUser: {id: '123'}}
```

#### Config


| Properties   | Type           | Default    | Description                                                   |
| -------- | -------------- | ---------- | ----------------------------------------------------------------- |
| `keystone`   | `Keystone` | (required) | A keystone instance used to set up the app.                       |
| `listName`   | `String`       | (required) | The keystone list name.                                                |
| `itemId` | `String`       | (required)       | The `id` of the item to be deleted.       |
| `returnFields` | `String`       | `id`       | Extract specific data fields from delete mutation. Use `comma` separated names of fields for extracting multiple fields.|
| `schemaName` | `String`       | `public`       | The name of your GraphQL API schema. To override the access-control mechanism, provide `internal` as schemaName. This will set all access-control to `true`|
| `extraContext` | `Object`       | `{}`       | The additional context option object that gets passed onto `keystone.executeGraphQL` method.|



### deleteItems

Allow bulk deleting of items.

#### Usage
```js
// Keystone list: 
keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: String },
  },
});

const { deleteItems } =  require('@keystonejs/server-side-graphql-client');

// Inside your async function
// Delete all users with ids: ['123', '456']
const deletedUsers = await deleteItems({keystone, listName: 'User', items: ['123', '456'], schemaName: 'schema name' });

console.log(deletedUsers); // {deteteUsers: [{id: '123', {id: '456'}}]}
```
#### Config


| Properties   | Type           | Default    | Description                                                   |
| -------- | -------------- | ---------- | ----------------------------------------------------------------- |
| `keystone`   | `Keystone` | (required) | A keystone instance used to set up the app.                       |
| `listName`   | `String`       | (required) | The keystone list name.                                                |
| `items` | `String[]`       | (required)| The array of item `ids` to be deleted.|
| `returnFields` | `String`       | `id`       | Extract specific data fields from delete mutation. Use `comma` separated names of fields for extracting multiple fields.|
| `schemaName` | `String`       | `public`       | The name of your GraphQL API schema. To override the access-control mechanism, provide `internal` as schemaName. This will set all access-control to `true`|
| `extraContext` | `Object`       | `{}`       | The additional context option object that gets passed onto `keystone.executeGraphQL` method.|

### runCustomQuery(options)

Allow executing a custom query.

#### Config


| Properties   | Type           | Default    | Description                                                   |
| -------- | -------------- | ---------- | ----------------------------------------------------------------- |
| `keystone`   | `Keystone` | (required) | A keystone instance used to set up the app.                       |
| `query` | `DocumentNode`  | (required)| The GraphQL query.|
| `variables` | `{[key: String]: any}`       | (required)| An object containing all of the variables your query needs to execute |
| `returnFields` | `String`       | `id`       | Extract specific data fields from delete mutation. Use `comma` separated names of fields for extracting multiple fields.|
| `schemaName` | `String`       | `public`       | The name of your GraphQL API schema. To override the access-control mechanism, provide `internal` as schemaName. This will set all access-control to `true`|
| `extraContext` | `Object`       | `{}`       | The additional context option object that gets passed onto `keystone.executeGraphQL` method.|
