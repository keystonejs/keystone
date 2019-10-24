<!--[meta]
section: api
subSection: apps
title: GraphQL Playground App
draft: true
[meta]-->

# GraphQL Playground App

A KeystoneJS App that creates an Apollo GraphQL playground.

## Usage

```javascript
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { GraphQLAppPlayground } = require('@keystonejs/app-graphql-playground');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');

// Ensure that the GraphQLApp and GraphQLAppPlayground are referring to the same endpoint
const apiPath = '/admin/api';
module.exports = {
  new Keystone(),
  apps: [
    // This should come before the GraphQLApp, as it sets up the dev query middleware
    new GraphQLAppPlayground({ apiPath })
    // Disable the default playground on this app
    new GraphQLApp({ apiPath, graphiqlPath: undefined }),
    new AdminUIApp()
  ],
};
```

## Config

| Option         | Type     | Default           | Description                               |
| -------------- | -------- | ----------------- | ----------------------------------------- |
| `apiPath`      | `String` | `/admin/api`      | Change the API path                       |
| `graphiqlPath` | `String` | `/admin/graphiql` | Change the Apollo GraphQL playground path |
