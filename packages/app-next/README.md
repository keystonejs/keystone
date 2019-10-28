<!--[meta]
section: api
subSection: apps
title: Next.js App
[meta]-->

# KeystoneJS Next.js App

A KeystoneJS App for serving a [Next.js](https://nextjs.org/) application.

## Usage

/!\ Pay attention, don't forget to disable `enableDefaultRoute` option on `AdminUIApp`.

```javascript
const { NextApp } = require('@keystonejs/app-next');

...

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp(authStrategy),
    new NextApp({ dir: 'app' }),
  ],
  distDir,
};
```

### Config

| Option | Type     | Default | Required | Description                       |
| ------ | -------- | ------- | -------- | --------------------------------- |
| `dir`  | `String` | `null`  | `true`   | The directory of the Next.js app. |
