---
section: discussions
title: Custom Server
---

# Custom Server

In some circumstances, you may want to do custom processing, or add extra routes
the server which handles API requests.

By default, the `keystone` CLI provides a server powered by `express` which is
started for you when you run the CLI.

A _Custom Server_  will act as the entry point to your application (either in
combination with, or as part of `index.js` which defines your schema) and must
handle initialising a server and applying the Keystone Apps.

Here are some different ways of creating a custom server:

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
  apps: [new GraphQLApp()]
}
```

`server.js`
```javascript
const express = require('express');
const { keystone, apps } = require('./index.js');
keystone.prepare({ apps, dev: process.env.NODE_ENV !== 'production' })
  .then(async ({ middlewares }) => {
    await keystone.connect();
    express().use(middlewares).listen(3000);
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
keystone.prepare({ apps, dev: process.env.NODE_ENV !== 'production' })
  .then(async ({ middlewares }) => {
    await keystone.connect();
    express().use(middlewares).listen(3000);
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
