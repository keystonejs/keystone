<!--[meta]
section: api
subSection: apps
title: Static App
[meta]-->

# KeystoneJS Static File App

A KeystoneJS App to serve static files such as images, CSS and JavaScript with support for client side routing.

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
      src: 'public',
      fallback: 'index.html',
    }),
  ],
};
```

## Options

### `path`

The path to serve files from. This is required and must be a string.

### `src`

The path to the folder containing static files. This is required and must be a string.

#### `fallback` (optional)

The path to the file to serve if none is found. This path is resolved relative to the `src` path.
