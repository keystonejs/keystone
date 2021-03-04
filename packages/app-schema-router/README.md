<!--[meta]
section: api
subSection: apps
title: GraphQL Schema Router
[meta]-->

# GraphQL Schema Router

[![View changelog](https://img.shields.io/badge/changelogs.xyz-Explore%20Changelog-brightgreen)](https://changelogs.xyz/@keystonejs/app-schema-router)

A KeystoneJS App that route requests to different GraphQL schemas.

The `SchemaRouterApp` allows you to define a `routerFn` which takes `(req, res)` and returns
a `routerId`, which is used to pick between different GraphQL schemas which exist at the same
`apiPath`.

## Usage

```javascript
const { Keystone } = require('@keystone-next/keystone-legacy');
const { GraphQLAppPlayground } = require('@keystone-next/app-graphql-playground-legacy');
const { SchemaRouterApp } = require('@keystone-next/app-schema-router-legacy');
const { GraphQLApp } = require('@keystone-next/app-graphql-legacy');
const { AdminUIApp } = require('@keystone-next/app-admin-ui-legacy');

module.exports = {
  keystone: new Keystone(),
  apps: [
    new GraphQLAppPlayground({ apiPath })
    new SchemaRouterApp({
      apiPath,
      routerFn: (req) => req.session.keystoneItemId ? 'private' : 'public',
      apps: {
        public: new GraphQLApp({ apiPath, schemaName: 'public', graphiqlPath: undefined }),
        private: new GraphQLApp({ apiPath, schemaName: 'private', graphiqlPath: undefined }),
      },
    }),
    new AdminUIApp()
  ],
};
```

## Config

| Option     | Type       | Default      | Description                                                    |
| ---------- | ---------- | ------------ | -------------------------------------------------------------- |
| `apiPath`  | `String`   | `/admin/api` | The GraphQL API path                                           |
| `routerFn` | `Function` | `() => {}`   | A function which takes `(req, res)` and returns a `routerId`   |
| `apps`     | `Object`   | `{}`         | An object with `routerId`s as keys and `GraphQLApp`s as values |
