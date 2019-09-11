<!--[meta]
section: api
subSection: apps
title: GraphQL API
draft: true
[meta]-->

# GraphQL App

A Keystone App that creates a GraphQL API and Apollo GraphQL playground.

For information about writing queries and mutations for Keystone see the [Introduction to Keystone's GraphQL API](https://v5.keystonejs.com/guides/intro-to-graphql).

## Usage

```javascript
const { Keystone } = require('@keystone-alpha/keystone');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const { AdminUIApp } = require('@keystone-alpha/app-admin-ui');

module.exports = {
  new Keystone(),
  apps: [
    new GraphQLApp({
      // All config keys are optional. Default values are shown here for completeness.
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

| Option         | Type     | Default                               | Description                                                                                          |
| -------------- | -------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `cors`         | `Object` | `{ origin: true, credentials: true }` | Options passed directly to the express [cors](https://github.com/expressjs/cors) middleware package. |
|                |          |                                       |                                                                                                      |
| `apiPath`      | `String` | `/admin/api`                          | Change the API path                                                                                  |
| `graphiqlPath` | `String` | `/admin/graphiql`                     | Change the Apollo GraphQL playground path                                                            |
| `schemaName`   | `String` | `admin`                               | Change the graphQL schema name (not recommended)                                                     |
| `apollo`       | `Object` | `{}`                                  | Options passed directly to Apollo Server                                                             |
