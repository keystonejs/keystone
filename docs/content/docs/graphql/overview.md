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

## Compound unique selectors

A list's [`db.unique`](../config/lists#indexes-and-compound-unique-constraints) declarations expose complete database-backed identities, without making each member individually unique:

```typescript
Page: list({
  access: allowAll,
  db: { unique: [{ fields: ['slug', 'domain'] }] },
  fields: {
    slug: text(),
    domain: text(),
    name: text(),
  },
}),
```

This generates a `slug_domain` selector in `PageWhereUniqueInput`, accepting an object of type `PageWhereUniqueInput_slug_domain` with required `slug: String!` and `domain: String!` members.
The name follows the declared field order, joined by underscores, not mapped database column names.
Database constraint names are distinct from this selector; this configuration does not expose custom naming options.
Apply the generated database constraint before using the selector, resolving any conflicting existing data first.
A validation hook or an ordinary index alone is not a database uniqueness guarantee and does not create a selector.

```graphql
query {
  page(where: { slug_domain: { slug: "/de/about", domain: "example.com" } }) {
    id
    name
  }
}
```

The same input works in update/delete operations, including each entry in bulk mutations:

```graphql
mutation {
  updatePage(
    where: { slug_domain: { slug: "/de/about", domain: "example.com" } }
    data: { name: "About" }
  ) { id }
}

mutation {
  deletePage(where: { slug_domain: { slug: "/de/about", domain: "example.com" } }) { id }
}
```

Compound selectors also work for relationship `connect`, to-many `set`/`disconnect`, and root or relationship pagination cursors:

```graphql
query {
  pages(
    cursor: { slug_domain: { slug: "/de/about", domain: "example.com" } }
    orderBy: [{ slug: asc }, { domain: asc }]
    skip: 1
    take: 20
  ) { id name }
}
```

Every tuple member is an exact value, not a filter object, and must be supplied and non-null.
Passing a null compound object is also an error; omit it when choosing another selector.
Nullable columns are permitted in the constraint, but standard unique constraints can allow duplicate null-containing tuples, so those tuples are not supported as selectors.
See [supported field kinds and null limitations](../config/lists#supported-fields-and-validation).

List operation access, row access filters, and each member's field filtering access continue to apply.
If a member is omitted from public filtering, the entire selector is omitted from the public schema.
`context.internal()` restores omitted inputs, not permission to bypass access control; `sudo()` retains its existing behavior.
Missing or inaccessible records follow the existing query/mutation error conventions.

A complete unique tuple is different from an ordinary multi-field filter.
`PageWhereInput` does not gain `slug_domain`; use `{ slug: { equals: "/de/about" }, domain: { equals: "example.com" } }` when filtering many items.
Existing ID, standalone unique, and one-to-one selectors remain available.
Supplying multiple selector keys retains the existing conjunctive behavior: the item must match all of them.

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

If a field has `isIndexed: 'unique'`, or the list has a 1-to-1 relationship, a `WhereUniqueInput` type will be added to the GraphQL schema output:

```graphql
input UserWhereUniqueInput {
  id: ID
  email: String
  profile: ProfileWhereUniqueInput
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
- `KS_PRISMA_ERROR`: An error occurred while running a Prisma client operation. Prisma error details may be stripped from GraphQL responses for security. You can use `graphql.apolloConfig.formatError` to customise this behaviour.

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
