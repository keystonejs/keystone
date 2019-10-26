<!--[meta]
section: api
subSection: apps
title: Next.js App
[meta]-->

# KeystoneJS Next.js App

A KeystoneJS App for serving a [Next.js](https://nextjs.org/) application.

## Usage

```javascript
const { NextApp } = require('@keystonejs/app-next');

...

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp(),
    new NextApp({ dir: 'app' }),
  ],
  distDir,
};
```

### Config

| Option | Type     | Default | Required | Description                       |
| ------ | -------- | ------- | -------- | --------------------------------- |
| `dir`  | `String` | `null`  | `true`   | The directory of the Next.js app. |
