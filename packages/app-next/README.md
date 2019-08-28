<!--[meta]
section: api
subSection: apps
title: Next.js App
[meta]-->

# Next.js App

## Usage

```javascript
const { NextApp } = require('@keystone-alpha/app-next');

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
