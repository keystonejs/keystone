<!--[meta]
section: guides
title: Custom server
subSection: advanced
[meta]-->

# Custom server

By default, the Keystone CLI starts an `express`-powered server for you when
running the `keystone dev` or `keystone start` commands.

In some circumstances, you may want to have more control over the server which
handles the GraphQL API and Admin UI. Things such as:

- Add additional routes
- Setup additional server middleware (`compress`/`brotli`/etc)
- Notify a 3rd party service when the API is ready

A **custom server** can replace the default and act as the entry point to your
application which consumes your [schema definition](/docs/guides/schema.md). A custom
server must handle initialising a http server which correctly executes any given Keystone apps.

> **Note:** Before reaching for a custom server, consider using a Keystone app which can enhance the functionality of the default server.

Apps available in Keystone include:

- [Static App](/packages/app-static/README.md) for serving static files.
- [Next.js App](/packages/app-next/README.md) for serving a Next.js App on the same server as the API
- [Nuxt.js App](/packages/app-nuxt/README.md) for serving a Nuxt.js App on the same server as the API

## You may not need a custom server

If all you want to do is some basic configuration of the default Express instance, you don't need a
custom server. The Keystone CLI accepts an additional `configureExpress` export in your `index.js` file.
This function takes a single `app` parameter. The running Express instance will be passed to this function
before any middlewares are set up, so you can perform any Express configuration you need here.

```javascript title=index.js
module.exports = {
  configureExpress: app => {
    app.set('view engine', 'pug');
  },
};
```

## Minimal custom server

```json title=package.json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

```javascript title=index.js
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');

const keystone = new Keystone({...});

module.exports = {
  keystone,
  apps: [new GraphQLApp()],
};
```

```javascript title=server.js
const express = require('express');
const { keystone, apps } = require('./index.js');

keystone
  .prepare({
    apps: apps,
    dev: process.env.NODE_ENV !== 'production',
  })
  .then(async ({ middlewares }) => {
    await keystone.connect();
    const app = express();

    app.use(middlewares).listen(3000);
  });
```

## All-in-one custom server

When using a custom server, there is nothing special about the `index.js` file.
In this example there is no `index.js` file, instead the `keystone` instance and
`apps` are declared directly in `server.js`.

```json title=package.json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

```javascript title=server.js
const express = require('express');
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');

const keystone = new Keystone({...});

keystone
  .prepare({
    apps: [new GraphQLApp()],
    dev: process.env.NODE_ENV !== 'production',
  })
  .then(async ({ middlewares }) => {
    await keystone.connect();
    const app = express();

    app.use(middlewares).listen(3000);
  });
```

## Custom server w/middleware

For really fine-grained control, a custom server can skip calling
`keystone.prepare()` in favour of calling an app's `.prepareMiddleware()`
function directly.

```json title=package.json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

```javascript title=server.js
const express = require('express');
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');

const keystone = new Keystone({...});

const dev = process.env.NODE_ENV !== 'production';
const apps = [new GraphQLApp(), new AdminUIApp()];
const preparations = apps.map(app =>
  app.prepareMiddleware({ keystone, dev })
);

Promise.all(preparations).then(async middlewares => {
  await keystone.connect();
  const app = express();

  app.use(middlewares).listen(3000);
});
```

## Custom server as a Lambda

Keystone is powered by Node, so it can run in "Serverless" environments such as
[AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) which
support Node >= 10.x.

With a little finesse (and the [`serverless-http`
library](https://github.com/dougmoscrop/serverless-http)), we can run our
Keystone instance in AWS Lambda:

```javascript title=lambda.js
const express = require('express');
const serverless = require('serverless-http');
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');

const keystone = new Keystone({...});

// Only setup once per instance
const setup = keystone
  .prepare({
    apps: [new GraphQLApp()],
    dev: process.env.NODE_ENV !== 'production',
  })
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
