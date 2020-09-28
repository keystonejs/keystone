<!--[meta]
section: guides
title: Introduction
subSection: graphql
order: 1
[meta]-->

# GraphQL API Introduction

_Before you begin:_ This guide assumes you have a running instance of Keystone with the GraphQL App configured, and a list with some data to query. (Get started in 5min by running `npx create-keystone-app` and select the `Starter` project)

Examples in this guide will refer to a `Users` list, however the queries, mutations and methods listed here would be the same for any Keystone list.

For each list, Keystone generates four top level queries. Given the following example:

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
  },
});
```

## Queries

Keystone would generate the following queries:

- `allUsers`
- `_allUsersMeta`
- `User`
- `_UsersMeta`

### `allUsers`

Retrieves all items from the `User` list. The `allUsers` query also allows you to search, limit and filter results. See: [Filter, limit and sorting](#filter-limit-and-sorting).

```graphql
query {
  allUsers {
    id
  }
}
```

### `_allUsersMeta`

Retrieves meta information about items in the `User` list such as a `count` of all items which can be used for pagination. The `_allUsersMeta` query accepts the same [filter, limit and sorting](#filter-limit-and-sorting) parameters as the `allUsers` query.

```graphql
query {
  _allUsersMeta {
    count
  }
}
```

### `User`

Retrieves a single item from the `User` list. The single entity query accepts a where parameter which must provide an id.

```graphql
query {
  User(where: { id: $id }) {
    name
  }
}
```

### `_UsersMeta`

Retrieves meta information about the `User` list itself (i.e. not about items in the list) such as access control information. This query accepts no parameters.

## Mutations

For each list Keystone generates six top level mutations:

- `createUser`
- `createUsers`
- `updateUser`
- `updateUsers`
- `deleteUser`
- `deleteUsers`

### `createUser`

Add a single `User` to the `User` list. Requires a `data` parameter that is an object where keys match the field names in the list definition and the values are the data to create.

```graphql
mutation {
  createUser(data: { name: "Mike" }) {
    id
  }
}
```

### `createUsers`

Creates multiple `Users`. Parameters are the same as `createUser` except the data parameter should be an array of objects.

```graphql
mutation {
  createUsers(data: [{ data: { name: "Mike" } }, { data: { name: "Maher" } }]) {
    id
    name
  }
}
```

### `updateUser`

Update a `User` by ID. Accepts an `id` parameter that should match the id of a `User` item. The object should contain keys matching the field definition of the list. `updateUser` performs a _partial update_, meaning only keys that you wish to update need to be provided.

```graphql
mutation {
  updateUser(id: ID, data: { name: "Simon" }) {
    id
  }
}
```

### `updateUsers`

Update multiple `Users` by ID. Accepts a single data parameter that contains an array of objects. The object parameters are the same as `createUser` and should contain an `id` and nested `data` parameter with the field data.

```graphql
mutation {
  updateUsers(data: [{ id: ID, data: { name: "Simon" } }]) {
    id
  }
}
```

### `deleteUser`

Delete a single Entity by ID. Accepts a single parameter where the `id` matches a `User` id.

```graphql
mutation {
  deleteUser(id: ID) {
    id
  }
}
```

### `deleteUsers`

Delete multiple entities by ID. Similar to `deleteUser` where the `id` parameter is an array of ids.
You can add more IDs like this `[ID1, ID2]` and don't forget to write the IDs in string format `""` like this `["5f67974b476e6e2d58c2bfb0", "5f67974b476e6e2d58c2bfb1"]`

```graphql
mutation {
  deleteUsers(ids: [ID]) {
    id
  }
}
```

## Execution

Before you begin writing application code, a great place test queries and mutations is the [GraphQL Playground](https://www.apollographql.com/docs/apollo-server/features/graphql-playground/).
The default path for Keystone' GraphQl Playground is `http://localhost:3000/admin/graphql`.
Here you can execute queries and mutations against the Keystone API without writing any JavaScript.

Once you have determined the correct query or mutation, you can add this to your application. To do this you will need to submit a `POST` request to Keystone' API. The default API endpoint is: `http://localhost:3000/admin/api`.

In our examples we're going to use the browser's [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to make a `POST` request.

We're going to write a query and store it in a variable named `GET_ALL_USERS`. Once you have a query you can execute this query using a `POST` request:

```javascript
const GET_ALL_USERS = `
query GetUsers {
  allUsers {
    name
    id
  }
}`;

const data = await fetch('/admin/api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: GET_ALL_USERS,
  }),
}).then(result => result.json());
```

The result should contain a `JSON` payload with the results from the query.

Executing mutations is the same, however we need to pass variables along with the mutation. The key for mutations in the post request is still `query`. Let's write a mutation called `ADD_USER`, and pass a `variables` object along with the mutation in the `POST` request:

```javascript
const ADD_USER = `
mutation AddUser($name: String!) {
  createUser(data: { name: $name }) {
    name
    id
  }
}`;

const data = await fetch('/admin/api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: ADD_USER,
    variables: { name: 'Mike' },
  }),
}).then(result => result.json());
```

A good next step is to write an `executeQuery` function that accepts a query and variables and returns the results from the API. Take a look at the `todo` sample application in the `cli` for examples of this.

> **Note:** If you have configured [Access Control](/docs/api/access-control.md) it can effect the result of some queries.

## Execution on the server

In addition to executing queries via the API, you can execute queries and mutations on the server using [the `keystone.executeGraphQL()` method](/docs/discussions/server-side-graphql.md).

## Filter, limit and sorting

When executing queries and mutations there are a number of ways you can filter, limit and sort items. These include:

- `where`
- `search`
- `skip`
- `first`
- `sortBy`

### `where`

Limit results to items matching the where clause. Where clauses are used to query fields in a keystone list before retrieving data.

The options available in a where clause depend on the field types.

```graphql
query {
  allUsers(where: { name_starts_with_i: "A" }) {
    id
  }
}
```

> **Note:** The documentation in the GraphQL Playground provides a complete reference of filters for any field type in your application.

#### Relationship `where` filters

- `{relatedList}_every`: whereInput
- `{relatedList}_some`: whereInput
- `{relatedList}_none`: whereInput
- `{relatedList}_is_null`: Boolean

#### String `where` filters

- `{Field}:` String
- `{Field}_not`: String
- `{Field}_contains`: String
- `{Field}_not_contains`: String
- `{Field}_starts_with`: String
- `{Field}_not_starts_with`: String
- `{Field}_ends_with`: String
- `{Field}_not_ends_with`: String
- `{Field}_i`: String
- `{Field}_not_i`: String
- `{Field}_contains_i`: String
- `{Field}_not_contains_i`: String
- `{Field}_starts_with_i`: String
- `{Field}_not_starts_with_i`: String
- `{Field}_ends_with_i`: String
- `{Field}_not_ends_with_i`: String
- `{Field}_in`: [String]
- `{Field}_not_in`: [String]

#### ID `where` filters

- `{Field}`: ID
- `{Field}_not`: ID
- `{Field}_in`: [ID!]
- `{Field}_not_in`: [ID!]

#### Integer `where` filters

- `{Field}`: Int
- `{Field}_not`: Int
- `{Field}_lt`: Int
- `{Field}_lte`: Int
- `{Field}_gt`: Int
- `{Field}_gte`: Int
- `{Field}_in`: [Int]
- `{Field}_not_in`: [Int]

#### Operators

You can combine multiple where clauses with `AND` or `OR` operators.

- `AND`: [whereInput]
- `OR`: [whereInput]

```graphql
query {
  allUsers(where: { OR: [{ name_starts_with_i: "A" }, { email_starts_with_i: "A" }] }) {
    id
  }
}
```

### `search`

Will search the list to limit results. For now, it can search only by `name` field. The `name` field must be a `Text` type.

```graphql
query {
  allUsers(search: "Mike") {
    id
  }
}
```

### `sortBy`

Order results.

Each list generates a GraphQL enum called `Sort{$listQueryName}By` containing possible sorting options based on its orderable fields in the format `<field>_<ASC|DESC>`. For example, a `User` list with `name` and `email` fields would add the following to the schema:

```graphql
enum SortUsersBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  email_ASC
  email_DESC
}
```

`sortBy` accepts one or more of these enum values. If a list of values is provided, sorting is evaluated left-to-right.

Order by name descending (alphabetical order, A -> Z):

```graphql
query {
  allUsers(sortBy: name_DESC) {
    id
  }
}
```

Order by name descending then email ascending:

```graphql title=
query {
  allUsers(sortBy: [name_DESC, email_ASC]) {
    id
  }
}
```

### `first`

Limits the number of items returned from the query. Limits will be applied after `skip`, `sortBy`, `where` and `search` values are applied.

If fewer results are available, the number of available results will be returned.

```graphql
query {
  allUsers(first: 10) {
    id
  }
}
```

### `skip`

Skip the number of results specified. Is applied before `first` parameter, but after `sortBy`, `where` and `search` values.

If the value of `skip` is greater than the number of available results, zero results will be returned.

```graphql
query {
  allUsers(skip: 10) {
    id
  }
}
```

## Combining query arguments

When `first` and `skip` are used together with the `count` from `_allUsersMeta`, this is sufficient to implement pagination on the list.

It is important to provide the same `where` and `search` arguments to both the `allUser` and `_allUserMeta` queries. For example:

```graphql
query {
  allUsers(search: "a", skip: 10, first: 10) {
    id
  }
  _allUsersMeta(search: "a") {
    count
  }
}
```

When `first` and `skip` are used together, skip works as an offset for the `first` argument. For example`(skip:10, first:5)` selects results 11 through 15.

Both `skip` and `first` respect the values of the `where`, `search` and `sortBy` arguments.

## Custom queries and mutations

You can add to Keystone's generated schema with custom types, queries, and mutations using the `keystone.extendGraphQLSchema()` method.

```javascript
keystone.extendGraphQLSchema({
  types: [{ type: 'type FooBar { foo: Int, bar: Float }' }],
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
