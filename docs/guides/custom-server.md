<!--[meta]
section: guides
title: Custom Server
subSection: advanced
[meta]-->

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
application which consumes your [schema definition](/guides/schema). A Custom
Server must handle initialising a http server which correctly executes any given KeystoneJS Apps.

_Note_: Before reaching for a custom server, consider using a KeystoneJS
App which can enhance the functionality of the default server. Apps
available in KeystoneJS include:

- [Static App](../../keystonejs/app-static) for serving static files.
- [Next.js App](../../keystonejs/app-next) for serving a Next.js App on the same server as the API
  The following are some possible ways of setting up a custom server, roughly in
  order of complexity.

## You might not need a custom server if...

If all you want to do is some basic configuration of the default Express instance, you don't need a
custom server. The KeystoneJS CLI accepts an additional `configureExpress` export in your `index.js` file:

```javascript
module.exports = {
  configureExpress: app => {
    /* ... */
  },
};
```

This function takes a single `app` parameter. The running Express instance will be passed to this function
before any middlewares are set up, so you can perform any Express configuration you need here. For example:

```javascript
module.exports = {
  configureExpress: app => {
    app.set('view engine', 'pug')
  },
};
```

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
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
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
    const app = express();
    app.use(middlewares).listen(3000);
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
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const keystone = new Keystone();
keystone.createList(/* ... */);
// ...
const apps = [new GraphQLApp()];
keystone
  .prepare({ apps, dev: process.env.NODE_ENV !== 'production' })
  .then(async ({ middlewares }) => {
    await keystone.connect();
    const app = express();
    app.use(middlewares).listen(3000);
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
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
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
    const app = express();
    app
      .use(middlewares)
      .listen(3000);
  });
```

## Custom Server as a Lambda

KeystoneJS is powered by Node, so can run in "Serverless" environments such as
[AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) which
support Node >= 10.x.

With a little finesse (and the [`serverless-http`
library](https://github.com/dougmoscrop/serverless-http)), we can run our
KeystoneJS instance in AWS Lambda:

`lambda.js`

```javascript
const express = require('express');
const serverless = require('serverless-http');
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const keystone = new Keystone();
keystone.createList(/* ... */);
// ...

// Only setup once per instance
const setup = keystone
  .prepare({ apps: [new GraphQLApp()], dev: process.env.NODE_ENV !== 'production' })
  .then(async ({ middlewares }) => {
    await keystone.connect();
    const app = express();
    app.use(middlewares);
    return serverless(app);
  });

module.exports.handler = async (event, context) => {
  const handler = await setup;
  return handler(event, context);
};
```
