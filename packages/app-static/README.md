<!--[meta]
section: api
subSection: apps
title: Static file app
[meta]-->

# Static file app

[![View changelog](https://img.shields.io/badge/changelogs.xyz-Explore%20Changelog-brightgreen)](https://changelogs.xyz/@keystonejs/app-static)

A KeystoneJS app to serve static files such as images, CSS and JavaScript with support for client side routing.

## Usage

`index.js`

```js
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { StaticApp } = require('@keystonejs/app-static');

module.exports = {
  keystone: new Keystone(),
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

## Config

| Option     | Type     | Required | Description                                                                                       |
| ---------- | -------- | -------- | ------------------------------------------------------------------------------------------------- |
| `path`     | `string` | `true`   | The path to serve files from.                                                                     |
| `src`      | `string` | `true`   | The path to the folder containing static files.                                                   |
| `fallback` | `string` | `false`  | The path to the file to serve if none is found. This path is resolved relative to the `src` path. |
