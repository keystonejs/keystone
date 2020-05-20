<!--[meta]
section: api
subSection: apps
title: GraphQL Playground App
draft: true
[meta]-->

# GraphQL Playground App

[![View changelog](https://img.shields.io/badge/changelogs.xyz-Explore%20Changelog-brightgreen)](https://changelogs.xyz/@keystonejs/app-graphql-playground)

A KeystoneJS App that creates an Apollo GraphQL playground.

## Usage

```javascript
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { GraphQLPlaygroundApp } = require('@keystonejs/app-graphql-playground');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');

// Ensure that the GraphQLApp and GraphQLAppPlayground are referring to the same endpoint
const apiPath = '/admin/api';

module.exports = {
  keystone: new Keystone(),
  apps: [
    // This should come before the GraphQLApp, as it sets up the dev query middleware
    new GraphQLPlaygroundApp({ apiPath })
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
