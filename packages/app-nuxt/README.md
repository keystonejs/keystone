<!--[meta]
section: api
subSection: apps
title: Nuxt.js App
[meta]-->

# Nuxt.js App

## Usage

```javascript
const { Nuxt } = require('@keystone-alpha/app-next');

...

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp(),
    new NuxtApp(),
  ],
  distDir,
};
```
