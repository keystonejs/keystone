<!--[meta]
section: api
subSection: apps
title: GraphQL API
draft: true
[meta]-->

# GraphQL Schema Router

A KeystoneJS App that route requests to different GraphQL schemas.

The `SchemaRouterApp` allows you to define a `routerFn` which takes `(req, res)` and returns
a `routerId`, which is used to pick between different GraphQL schemas which exist at the same
`apiPath`.

## Usage

```javascript
const { Keystone } = require('@keystone/keystone');
const { GraphQLAppPlayground } = require('@keystone/app-graphql-playground');
const { SchemaRouterApp } = require('@keystone/app-schema-router');
const { GraphQLApp } = require('@keystone/app-graphql');
const { AdminUIApp } = require('@keystone/app-admin-ui');

module.exports = {
  new Keystone(),
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

| Option     | Type       | Default      | Description                                                  |
| ---------- | ---------- | ------------ | ------------------------------------------------------------ |
| `apiPath`  | `String`   | `/admin/api` | Change the API path                                          |
| `routerFn` | `Function` | `() => {}`   | A function which takes `(req, res)` and returns a `routerId` |
| `apps`     | `Object`   | `{}`         | An object with `routerId`s as key and `GraphQLApp` as value  |
