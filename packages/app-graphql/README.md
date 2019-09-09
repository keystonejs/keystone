<!--[meta]
section: api
subSection: apps
title: GraphQL API
[meta]-->

# GraphQL App

A Keystone App that creates a GraphQL API and Apollo GraphQL playground.

For information about writing queries and mutations for Keystone see the [Introduction to Keystone's GraphQL API](/guides/intro-to-keystone).

## Usage

```javascript
const { Keystone } = require('@keystone-alpha/keystone');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const { AdminUIApp } = require('@keystone-alpha/app-admin-ui');

module.exports = {
  new Keystone(),
  apps: [
    new GraphQLApp({
        cors : { origin: true, credentials: true },
        apiPath : '/admin/api',
        graphiqlPath : '/admin/graphiql',
        schemaName : 'admin',
        apollo : {},
    }),
    new AdminUIApp()
  ],
};
```

## Config

| Option         | Type     | Default                               | Description                               |
| -------------- | -------- | ------------------------------------- | ----------------------------------------- |
| `cors`         | `Object` | `{ origin: true, credentials: true }` | Used to enable cors                       |
| `apiPath`      | `String` | `/admin/api`                          | Change the API path                       |
| `graphiqlPath` | `String` | `/admin/graphiql`                     | Change the Apollo GraphQL playground path |
| `schemaName`   | `String` | `admin`                               | Change the graphQL schema name            |
| `apollo`       | `Object` | `{}`                                  | Options passed directly tom Apollo        |

### `cors`

Options passed directly to the express [cors](https://github.com/expressjs/cors) middleware package.

### `apiPath`

Used to change the default API path.

### `graphiqlPath`

Used to change the default Apollo GraphQL playground path.

#### `schemaName`

Change the default graphQL `schemaName` (not recommended).

#### `apollo`

Options object passed to the [ApolloServer](https://www.apollographql.com/docs/apollo-server/api/apollo-server/#apolloserver) constructor.
