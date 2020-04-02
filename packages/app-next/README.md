<!--[meta]
section: api
subSection: apps
title: Next.js app
[meta]-->

# Next.js app

[![View changelog](https://img.shields.io/badge/changelogs.xyz-Explore%20Changelog-brightgreen)](https://changelogs.xyz/@keystonejs/app-next)

A KeystoneJS app for serving a [Next.js](https://nextjs.org/) application.

## Usage

```javascript
const { NextApp } = require('@keystonejs/app-next');

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({ enableDefaultRoute: false }),
    new NextApp({ dir: 'app' }),
  ],
  distDir,
};
```

### Config

| Option | Type     | Default | Required | Description                       |
| ------ | -------- | ------- | -------- | --------------------------------- |
| `dir`  | `String` | `null`  | `true`   | The directory of the Next.js app. |
