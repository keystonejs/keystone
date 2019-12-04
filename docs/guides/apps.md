<!--[meta]
section: guides
title: KeystoneJS Apps
[meta]-->

# KeystoneJS Apps

A KeystoneJS instance can be summarised as a function of your schema which
creates a GraphQL API for querying, and an AdminUI for managing your data:

```
schema => ({ GraphQL, AdminUI })
```

Here, `GraphQL` and `AdminUI` are referred to as **Apps**.

A KeystoneJS **App** has two primary purposes

1. Prepare an `express`-compatible middleware for handling incoming http requests
2. Provide a `build()` method to create a static production build for this app

The mimimum KeystoneJS application requires at least one app, the [GraphQL API](/packages/app-graphql):

`index.js`

```javascript
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { Keystone } = require('@keystonejs/keystone');

const keystone = new Keystone(/* ... */);

// ...

module.exports = {
  keystone,
  apps: [new GraphQLApp()],
};
```

Most of the time the `GraphQLApp` will be paired with an `AdminUIApp` which
provides the functionality of the KeystoneJS Admin UI:

`index.js`

```diff
 const { GraphQLApp } = require('@keystonejs/app-graphql');
+const { AdminUIApp } = require('@keystonejs/app-admin-ui');
 const { Keystone } = require('@keystonejs/keystone');

 const keystone = new Keystone(/* ... */);

 // ...

 module.exports = {
   keystone,
   apps: [
     new GraphQLApp(),
+    new AdminUIApp(),
   ]
 }
```

In both cases, the `keystone dev` and `keystone start` commands will consume the
exported `.apps` array, making their middleware available in the order the apps
are specified.

If you're using a [Custom Server](/docs/guides/custom-server.md), it will be your
responsibility to ensure each app's middleware is correctly injected into any
http server you setup.

Other interesting KeystoneJS compatible Apps are:

- [Static App](/packages/app-static) for serving static files.
- [Next.js App](/packages/app-next) for serving a Next.js App on the same server as the API
