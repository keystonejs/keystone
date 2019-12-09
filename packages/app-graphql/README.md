<!--[meta]
section: api
subSection: apps
title: GraphQL API
[meta]-->

# GraphQL App

A KeystoneJS App that creates a GraphQL API and GraphiQL playground.

The GraphiQL playground is disabled in production mode.

For information about writing queries and mutations for KeystoneJS see the [Introduction to KeystoneJS' GraphQL API](https://keystonejs.com/guides/intro-to-graphql).

## Usage

```javascript
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');

module.exports = {
  keystone: new Keystone(),
  apps: [
    new GraphQLApp({
      // All config keys are optional. Default values are shown here for completeness.
      apiPath: '/admin/api',
      graphiqlPath: '/admin/graphiql',
      schemaName: 'admin',
      apollo: {},
    }),
    new AdminUIApp(),
  ],
};
```

## Config

| Option         | Type     | Default           | Description                                      |
| -------------- | -------- | ----------------- | ------------------------------------------------ |
| `apiPath`      | `String` | `/admin/api`      | Change the API path                              |
| `graphiqlPath` | `String` | `/admin/graphiql` | Change the GraphiQL playground path              |
| `schemaName`   | `String` | `admin`           | Change the graphQL schema name (not recommended) |
| `apollo`       | `Object` | `{}`              | Options passed directly to Apollo Server         |
