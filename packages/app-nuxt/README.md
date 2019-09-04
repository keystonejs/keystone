<!--[meta]
section: api
subSection: apps
title: Nuxt.js App
[meta]-->

# Nuxt.js App

## Usage

```javascript
const { NuxtApp } = require('@keystone-alpha/app-nuxt');

...

const config = {
  srcDir: "src",
  buildDir: "dist",
  // ...
}

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp(),
    new NuxtApp(config),
  ]
};
```

### Config

A config object can be passed to the `NuxtApp` instance. Documentation for the `nuxtConfig` options are available on the [NuxtJS documentation website](https://nuxtjs.org/guide/configuration).