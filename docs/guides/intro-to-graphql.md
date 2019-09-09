<!--[meta]
section: guides
title: GraphQL
[meta]-->

# Introduction to the GraphQL API

_Before you begin:_ This guide assumes you have running instance of Keystone with the GraphQL App configured, and a list with some data to query. (Get started in 5min by running `npx create-keystone-app` and select the `Starter` project)

Examples in this guide will refer to a `Users` list, however the queries, mutations and methods listed here would be the same for any Keystone list.

For each List, Keystone generates four top level queries. Given the following example:

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

### allUsers

Retrieves all items from the user list. The `allUsers` query also allows you to search, limit and filter results. See: [Search and Filtering](#search-and-filtering).

#### Usage

```gql
query {
  allUsers {
    id
  }
}
```

### \_allUsersMeta

Retrieves meta information about items in the user list such as a `count` of all items which can be used for pagination. The `_allUsersMeta` query accepts the same [search and filtering](#search-and-filtering) parameters as the `allUsers` query.

#### Usage

```gql
query {
  _allUsersMeta {
    count
  }
}
```

### User

Retrieves a single item from the User list. The single entity query accepts a where parameter which must provide an id.

#### Usage

```gql
query {
  User(where: { id: ID }) {
    name
  }
}
```

### \_UsersMeta

Retrieves meta information about the user list itself (ie; not about items in the list) such as access control information. This query accepts no parameters.

## Mutations

For each list Keystone generates six top level mutations:

- `createUser`
- `createUsers`
- `updateUser`
- `updateUsers`
- `deleteUser`
- `deleteUsers`

### createUser

Add a single User to the Users list. Requires a `data` parameter that is an object where keys match the field names in the list definition and the values are the data to create.

#### Usage

```gql
mutation {
  createUser(data: { name: "Mike" }) {
    id
  }
}
```

### createUsers

Creates multiple users. Parameters are the same as `createUser` except the data parameter should be an array of objects.

#### Usage

```gql
mutation {
  createUsers(data: [{ name: "Mike" }]) {
    id
  }
}
```

### updateUser

Update a User by ID. Accepts an `id` parameter that should match the id of a user item. The object should contain keys matching the field definition of the list. `updateUser` performs a _partial update_, meaning only keys that you wish to update need to be provided.

#### Usage

```gql
mutation {
  updateUser(id: ID, data: { name: "Simon" }) {
    id
  }
}
```

### updateUsers

Update multiple Users by ID. Accepts a single data parameter that contains an array of objects. The object parameters are the same as `createUser` and should contain an `id` and nested `data` parameter with the field data.

```gql
mutation {
  updateUsers(data: [{ id: ID, data: { name: "Simon" } }]) {
    id
  }
}
```

### deleteUser

Delete a single Entity by ID. Accepts a single parameter where the `id` matches a user id.

```gql
mutation {
  deleteUser(id: ID)
}
```

### deleteUsers

Delete multiple entities by ID. Similar to `deleteUser` where the `id` parameter is an array of ids.

```gql
mutation {
  deleteUsers(id: [ID])
}
```

## Executing Queries and Mutations

Before you begin writing application code, a great place test queries and mutations is the [GraphQL Playground](https://www.apollographql.com/docs/apollo-server/features/graphql-playground/). The default path for Keystone's GraphQl Playground is `http://localhost:3000/admin/graphql`. Here you can execute queries and mutations against the Keystone API without writing any JavaScript.

Once you have determined the correct query or mutation, you can add this to your application. To do this you will need to submit a `POST` request to Keystone's API. The default API endpoint is: `http://localhost:3000/admin/api`.

In our examples we're going to use the browser's [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to make a `POST` request.

First of all let's save a simple query in a variable:

```javascript
const GET_ALL_USERS = `
query GetUsers {
  allUsers {
    name
    id
  }
}`;
```

We can then execute this query using a `POST` request:

```javascript
fetch('/admin/api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: {
    query: GET_ALL_USERS,
  },
}).then(result => result.json());
```

The result should contain a `JSON` payload with the results from the query.

Executing mutations is the same, however we need to pass variables along with the mutation:

```javascript
const ADD_USER = `
mutation AddUser($name: String!) {
  createUser(data: { name: $name }) {
    name
    id
  }
}`;
```

The key for mutations is still `query`:

```javascript
fetch('/admin/api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: {
    query: ADD_USER,
    variables: { name: 'Mike' },
  },
}).then(result => result.json());
```

**Note:** Queries via the API will enforce [Access Control](https://v5.keystonejs.com/api/access-control).

## Executing Queries and Mutations on the Server

In addition to executing queries via the API, you can execute queries and mutations on the server using [the `keystone.executeQuery()` method](https://v5.keystonejs.com/keystone-alpha/keystone/#executequeryquerystring-config).

**Note: ** No access control checks are run when executing queries on the server. Any queries or mutations that checked for `context.req` in the resolver may also return different results as the `req` object is set to `{}`.

See: [Keystone executeQuery()](https://v5.keystonejs.com/keystone-alpha/keystone/#executequeryquerystring-config)

## Filter, Limit and Sorting

When executing queries and mutations there are a number of ways you can filter, limit and sort items. These include:

- `where`
- `search`
- `skip`
- `first`
- `orderby`

#### `where`

Limit results to items matching the where clause. Where clauses are used to query fields in a keystone list before retrieving data.

The options available in a where clause depend on the field types.

```gql
query {
  allUsers (where: { name_starts_with_i: 'A'} ) {
    id
  }
}
```

##### Relationship `where` filters

- `{relatedList}_every`: whereInput
- `{relatedList}_some`: whereInput
- `{relatedList}_none`: whereInput
- `{relatedList}_is_null`: Boolean

##### String `where` filters

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

##### ID `where` filters

- `{Field}`: ID
- `{Field}_not`: ID
- `{Field}_in`: [ID!]
- `{Field}_not_in`: [ID!]

##### Integer `where` filters

- `{Field}: Int`
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

#### `search`

Will search the list to limit results.

```gql
query {
  allUsers(search: "Mike") {
    id
  }
}
```

#### `orderBy`

Order results. The orderBy string should match the format `<field>_<ASC|DESC>`. For example, to order by name descending (alphabetical order, A -> Z):

```gql
query {
  allUsers(orderBy: "name_DESC") {
    id
  }
}
```

#### `first`

Limits the number of items returned from the query. Limits will be applied after `skip`, `orderBy`, `where` and `search` values are applied.

If less results are available, the number of available results will be returned.

```gql
query {
  allUsers(first: 10) {
    id
  }
}
```

#### `skip`

```gql
query {
  allUsers(skip: 10) {
    id
  }
}
```

Skip the number of results specified. Is applied before `first` parameter, but after `orderBy`, `where` and `search` values.

If the value of `skip` is greater than the number of available results, zero results will be returned.

## Custom queries and Mutations

You can add to Keystone's generated schema with custom types, queries, and mutations using the `keystone.extendGraphQLSchema()` method.

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

### Combining query arguments for pagination

When `first` and `skip` are used together with the `count` from `_allUsersMeta`, this is sufficient to implement pagination on the list.

It is important to provide the same `where` and `search` arguments to both the `allUser` and `_allUserMeta` queries. For example:

```gql
query {
  allUsers (search:'a', skip: 10, first: 10) {
    id
  }
  _allUsersMeta(search: 'a') {
    count
  }
}
```

When `first` and `skip` are used together, skip works as an offset for the `first` argument. For example`(skip:10, first:10)` selects results 11 through 20.

Both `skip` and `first` respect the values of the `where`, `search` and `orderBy` arguments.
