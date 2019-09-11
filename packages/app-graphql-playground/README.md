<!--[meta]
section: api
subSection: apps
title: GraphQL Playground App
draft: true
[meta]-->

# GraphQL Playground App

A Keystone App that creates an Apollo GraphQL playground.

## Usage

FIXME

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

FIXME

| Option         | Type     | Default           | Description                               |
| -------------- | -------- | ----------------- | ----------------------------------------- |
| `apiPath`      | `String` | `/admin/api`      | Change the API path                       |
| `graphiqlPath` | `String` | `/admin/graphiql` | Change the Apollo GraphQL playground path |
