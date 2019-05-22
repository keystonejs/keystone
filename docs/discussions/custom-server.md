---
section: discussions
title: Custom Server
---

# Custom Server

By default, the KeystoneJS CLI starts an `express`-powered server for you when
running the `keystone dev` or `keystone start` commands.

In some circumstances, you may want to have more control over the server which
handles the GraphQL API and Admin UI. Things such as:

- Add additional routes
- Setup additional server middleware (`compress`/`brotli`/etc)
- Notify a 3rd party service when the API is ready
- ... etc

A **Custom Server** can replace the default and act as the entry point to your
application which consumes your [schema definition](./schema.md). A Custom
Server must handle initialising a http server which correctly executes any given
[KeystoneJS Apps](./apps.md).

_NOTE_: Before reaching for a custom server, consider using a [KeystoneJS
App](./apps.md) which can enhance the functionality of the default server. Apps
available in Keystone include:

- [Static App](../keystone-alpha/app-static) for serving static files.
- [Next.js App](../keystone-alpha/app-next) for serving a Next.js App on the same server as the API
- ...[plus more](./apps.md)

The following are some possible ways of setting up a custom server, roughly in
order of complexity.

## Minimal Custom Server

`package.json`

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

`index.js`

```javascript
const { Keystone } = require('@keystone-alpha/keystone');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const keystone = new Keystone(/* ... */);
module.exports = {
  keystone,
  apps: [new GraphQLApp()],
};
```

`server.js`

```javascript
const express = require('express');
const { keystone, apps } = require('./index.js');
keystone
  .prepare({ apps, dev: process.env.NODE_ENV !== 'production' })
  .then(async ({ middlewares }) => {
    await keystone.connect();
    express()
      .use(middlewares)
      .listen(3000);
  });
```

## All-in-one Custom Server

When using a custom server, there is nothing special about the `index.js` file.
In this example there is no `index.js` file, instead the `keystone` instance and
`apps` are declared directly in `server.js`.

`package.json`

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

`server.js`

```javascript
const express = require('express');
const { Keystone } = require('@keystone-alpha/keystone');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const keystone = new Keystone();
keystone.createList(/* ... */);
// ...
const apps = [new GraphQLApp()];
keystone
  .prepare({ apps, dev: process.env.NODE_ENV !== 'production' })
  .then(async ({ middlewares }) => {
    await keystone.connect();
    express()
      .use(middlewares)
      .listen(3000);
  });
```

## Custom Server with manual middleware preparation

For really fine-grained control, a custom server skip calling
`keystone.prepare()` in favour of calling an app's `.prepareMiddleware()`
function directly.

`package.json`

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

`server.js`

```javascript
const express = require('express');
const { Keystone } = require('@keystone-alpha/keystone');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const { AdminUIApp } = require('@keystone-alpha/app-admin-ui');
const keystone = new Keystone();
keystone.createList(/* ... */);
// ...
const dev = process.env.NODE_ENV !== 'production';
const preparations = [
  new GraphQLApp(),
  new AdminUIApp()
].map(app => app.prepareMiddleware({ keystone, dev }));

Promise.all(preparations)
  .then(middlewares => {
    await keystone.connect();
    express().use(middlewares).listen(3000);
  });
```

## Custom Server as a Lambda

Keystone is powered by Node, so can run in "Serverless" environments such as
[AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) which
support Node >= 10.x.

With a little finesse (and the [`serverless-http`
library](https://github.com/dougmoscrop/serverless-http)), we can run our
Keystone instance in AWS Lambda:

`lambda.js`

```javascript
const express = require('express');
const serverless = require('serverless-http');
const { Keystone } = require('@keystone-alpha/keystone');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const keystone = new Keystone();
keystone.createList(/* ... */);

// ...

// Only setup once per instance
const setup = keystone
  .prepare({ apps: [new GraphQLApp()], dev: process.env.NODE_ENV !== 'production' })
  .then(async ({ middlewares }) => {
    await keystone.connect();
    const app = express().use(middlewares);
    return serverless(app);
  });

module.exports.handler = async (event, context) => {
  const handler = await setup;
  return handler(event, context);
};
```
