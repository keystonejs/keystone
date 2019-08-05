<!--[meta]
section: packages
title: KeystoneJS Static File App
[meta]-->

# KeystoneJS Static File App

A Keystone App to serve static files such as images, CSS and JavaScript with support for client side routing.

## Usage

`index.js`

```js
const { Keystone } = require('@keystone-alpha/keystone');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const { AdminUIApp } = require('@keystone-alpha/app-admin-ui');
const { StaticApp } = require('@keystone-alpha/app-static');

module.exports = {
  new Keystone(),
  apps: [
    new GraphQLApp(),
    new AdminUIApp(),
    new StaticApp({
      path: '/',
      src: pathModule.join(__dirname, 'build'),
      fallback: 'index.html',
    }),
  ],
};
```

## Options

### `path`

The path to serve files from.

### `src`

The path to the folder containing static files.

#### `fallback` (optional)

The path to the file to serve if none is found. This path is resolved relative to the `src` path.
