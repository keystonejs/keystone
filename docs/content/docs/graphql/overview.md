---
title: "GraphQL Overview"
description: "Reference docs for Keystone’s CRUD (create, read, update, delete) GraphQL API. Based on the schema definitions outlined in your system config."
---

Keystone generates a CRUD (create, read, update, delete) GraphQL API based on the [schema](../config/lists) definition provided in the system [config](../config/config).

## Using the API

By default Keystone serves your GraphQL endpoint at `/api/graphql`.
When `NODE_ENV=production` is not set, by default Keystone serves the [GraphQL playground](https://github.com/graphql/graphql-playground), an in-browser GraphQL IDE for debugging and exploring the API and GraphQL schema that Keystone built.

With the default configuration, the GraphQL playground and API endpoint is served on the path [`http://localhost:3000/api/graphql`](http://localhost:3000/api/graphql).

The URL of the GraphQL API is often configured as an environment variable when building or developing your frontend application, when [initializing your GraphQL instance](https://www.apollographql.com/docs/react/get-started/#2-initialize-apolloclient) (example is Apollo, but any GraphQL client is OK).
For example:

```js
const client = new ApolloClient({
  uri: process.env.APOLLO_CLIENT_GRAPHQL_URI || 'http://localhost:3000/api/graphql',
  cache: new InMemoryCache()
});
```

If you don't like the default path you can control where the GraphQL API and playground are published by setting `config.graphql.path` in the [Keystone configuration](https://keystonejs.com/docs/config/config#graphql).
For security through obscurity, the playground and [introspection](https://graphql.org/learn/introspection/) is disabled when running Keystone with `NODE_ENV=production`.

You can modify this behaviour using the `config.graphql.playground` and `config.graphql.apolloConfig` options.
For example, to disable these features irrespective of the `NODE_ENV` environment variables, add this to your Keystone config: `graphql: { playground: false, apolloConfig: { introspection: false } }`.

## Example

Consider the following system definition:

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    User: list({ fields: { name: text() } }),
  },
  /* ... */
});
```

This system will generate the following GraphQL API.

**Note:** The names and types of the generated queries and mutations are based on the names of the lists and fields in the system config.

```graphql
type Query {
  users(
    where: UserWhereInput! = {}
    orderBy: [UserOrderByInput!]! = []
    take: Int
    skip: Int! = 0
  ): [User!]
  user(where: UserWhereUniqueInput!): User
  usersCount(where: UserWhereInput! = {}): Int
}

type User {
  id: ID!
  name: String
}

input UserWhereUniqueInput {
  id: ID
}

input UserWhereInput {
  AND: [UserWhereInput!]
  OR: [UserWhereInput!]
  NOT: [UserWhereInput!]
  id: IDFilter
  name: StringNullableFilter
}

input IDFilter {
  equals: ID
  in: [ID!]
  notIn: [ID!]
  lt: ID
  lte: ID
  gt: ID
  gte: ID
  not: IDFilter
}

input StringNullableFilter {
  equals: String
  in: [String!]
  notIn: [String!]
  lt: String
  lte: String
  gt: String
  gte: String
  contains: String
  startsWith: String
  endsWith: String
  mode: QueryMode
  not: NestedStringNullableFilter
}

enum QueryMode {
  default
  insensitive
}

input NestedStringNullableFilter {
  equals: String
  in: [String!]
  notIn: [String!]
  lt: String
  lte: String
  gt: String
  gte: String
  contains: String
  startsWith: String
  endsWith: String
  not: NestedStringNullableFilter
}

input UserOrderByInput {
  id: OrderDirection
  name: OrderDirection
}

enum OrderDirection {
  asc
  desc
}

type Mutation {
  createUser(data: UserCreateInput!): User
  createUsers(data: [UserCreateInput!]!): [User]
  updateUser(where: UserWhereUniqueInput!, data: UserUpdateInput!): User
  updateUsers(data: [UserUpdateArgs!]!): [User]
  deleteUser(where: UserWhereUniqueInput!): User
  deleteUsers(where: [UserWhereUniqueInput!]!): [User]
}

input UserUpdateInput {
  name: String
}

input UserUpdateArgs {
  where: UserWhereUniqueInput!
  data: UserUpdateInput!
}

input UserCreateInput {
  name: String
}
```

### Queries

#### `user`

```graphql
type Query {
  user(where: UserWhereUniqueInput!): User
}

type User {
  id: ID!
  name: String
}

input UserWhereUniqueInput {
  id: ID
}
```

#### `users`

```graphql
type Query {
  users(
    where: UserWhereInput! = {}
    orderBy: [UserOrderByInput!]! = []
    take: Int
    skip: Int! = 0
  ): [User!]
}

type User {
  id: ID!
  name: String
}

input UserWhereInput {
  AND: [UserWhereInput!]
  OR: [UserWhereInput!]
  NOT: [UserWhereInput!]
  id: IDFilter
  name: StringNullableFilter
}

input IDFilter {
  equals: ID
  in: [ID!]
  notIn: [ID!]
  lt: ID
  lte: ID
  gt: ID
  gte: ID
  not: IDFilter
}

input StringNullableFilter {
  equals: String
  in: [String!]
  notIn: [String!]
  lt: String
  lte: String
  gt: String
  gte: String
  contains: String
  startsWith: String
  endsWith: String
  mode: QueryMode
  not: NestedStringNullableFilter
}

enum QueryMode {
  default
  insensitive
}

input NestedStringNullableFilter {
  equals: String
  in: [String!]
  notIn: [String!]
  lt: String
  lte: String
  gt: String
  gte: String
  contains: String
  startsWith: String
  endsWith: String
  not: NestedStringNullableFilter
}

input UserOrderByInput {
  id: OrderDirection
  name: OrderDirection
}

enum OrderDirection {
  asc
  desc
}
```

#### `usersCount`

```graphql
type Query {
  usersCount(where: UserWhereInput! = {}): Int
}

input UserWhereInput {
  AND: [UserWhereInput!]
  OR: [UserWhereInput!]
  NOT: [UserWhereInput!]
  id: IDFilter
  name: StringNullableFilter
}

input IDFilter {
  equals: ID
  in: [ID!]
  notIn: [ID!]
  lt: ID
  lte: ID
  gt: ID
  gte: ID
  not: IDFilter
}

input StringNullableFilter {
  equals: String
  in: [String!]
  notIn: [String!]
  lt: String
  lte: String
  gt: String
  gte: String
  contains: String
  startsWith: String
  endsWith: String
  mode: QueryMode
  not: NestedStringNullableFilter
}

enum QueryMode {
  default
  insensitive
}

input NestedStringNullableFilter {
  equals: String
  in: [String!]
  notIn: [String!]
  lt: String
  lte: String
  gt: String
  gte: String
  contains: String
  startsWith: String
  endsWith: String
  not: NestedStringNullableFilter
}
```

### Mutations

#### `createUser`

```graphql
type Mutation {
  createUser(data: UserCreateInput!): User
}

input UserCreateInput {
  name: String
}

type User {
  id: ID!
  name: String
}
```

#### `createUsers`

```graphql
type Mutation {
  createUsers(data: [UserCreateInput!]!): [User]
}

input UserCreateInput {
  name: String
}

type User {
  id: ID!
  name: String
}
```

#### `updateUser`

```graphql
type Mutation {
  updateUser(where: UserWhereUniqueInput!, data: UserUpdateInput!): User
}

input UserWhereUniqueInput {
  id: ID
}

input UserUpdateInput {
  name: String
}

type User {
  id: ID!
  name: String
}
```

#### `updateUsers`

```graphql
type Mutation {
  updateUsers(data: [UserUpdateArgs!]!): [User]
}

input UserUpdateArgs {
  where: UserWhereUniqueInput!
  data: UserUpdateInput!
}

input UserWhereUniqueInput {
  id: ID
}

input UserUpdateInput {
  name: String
}

type User {
  id: ID!
  name: String
}
```

#### `deleteUser`

```graphql
type Mutation {
  deleteUser(where: UserWhereUniqueInput!): User
}

input UserWhereUniqueInput {
  id: ID
}

type User {
  id: ID!
  name: String
}
```

#### `deleteUsers`

```graphql
type Mutation {
  deleteUsers(ids: [UserWhereUniqueInput!]!): [User]
}

input UserWhereUniqueInput {
  id: ID
}

type User {
  id: ID!
  name: String
}
```

## Errors

The Keystone GraphQL API is powered by Apollo Server.
When something goes wrong with a query or mutation, one or more errors will be returned in the `errors` array returned to the [GraphQL client](https://www.apollographql.com/docs/react/data/error-handling/).

Keystone provides [custom errors](https://www.apollographql.com/docs/apollo-server/data/errors/#custom-errors) where possible, including custom error codes and messages.
These error codes and messages can be used to provide useful feedback to users, and also to help identify possible bugs in your system.
The following error codes can be returned from the Keystone GraphQL API.

- `KS_USER_INPUT_ERROR`: The input to the operation is syntactically correct GraphQL, but the values provided are invalid. E.g, an `orderBy` input without any keys.
- `KS_ACCESS_DENIED`: The operation is not allowed because either an [Access Control](../config/access-control) rule prevents it, or the item does not exist.
- `KS_FILTER_DENIED`: The filter or ordering operation is not allowed because of [`isFilterable` or `isOrderable`](../fields/overview#common-configuration) rules.
- `KS_VALIDATION_FAILURE`: The operation is not allowed because of a [validation](../guides/hooks#validating-inputs) rule.
- `KS_LIMITS_EXCEEDED`: The user has exceeded some query limits. E.g, a `take` input [that is too high](../config/lists#graphql).
- `KS_EXTENSION_ERROR`: An error was thrown while excuting a system extension function, such as a hook or an access control function.
- `KS_ACCESS_RETURN_ERROR`: An invalid value was returned from an access control function.
- `KS_RESOLVER_ERROR`: An error occurred while resolving the input for a field.
- `KS_RELATIONSHIP_ERROR`: An error occurred while resolving the input relationship field.
- `KS_PRISMA_ERROR`: An error occurred while running a Prisma client operation.

> A note on `KS_ACCESS_DENIED`: Returning a "not found" error from a mutation like `updateUser({ where: { secretKey: 'abc' } })` but an "access denied" error from `updateUser({ where: { secretKey: 'def' } })` would reveal the existence of a user with the secret key "def". To prevent leaking private information in this way, Keystone will always say "access denied" when you try to perform a mutation on an item that can't be operated on, whether that is because there is no matching record in the database, or there was but the user performing the operation doesn't have access to it.

## Related resources

{% related-content %}
{% well
heading="Lists API Reference"
href="/docs/config/lists" %}
The API to configure your options used with the `list()` function.
{% /well %}
{% well
heading="Config API Reference"
href="/docs/config/config" %}
The API to configure all the parts of your Keystone system.
{% /well %}
{% /related-content %}
