<!--[meta]
section: api
subSection: apps
title: Nuxt.js app
[meta]-->

# Nuxt.js app

[![View changelog](https://img.shields.io/badge/changelogs.xyz-Explore%20Changelog-brightgreen)](https://changelogs.xyz/@keystonejs/app-nuxt)

## Usage

```javascript
const { NuxtApp } = require('@keystonejs/app-nuxt');

const config = {
  srcDir: 'src',
  buildDir: 'dist',
};

module.exports = {
  keystone,
  apps: [new GraphQLApp(), new AdminUIApp(), new NuxtApp(config)],
};
```

### Config

A config object can be passed to the `NuxtApp` instance. Documentation for the `nuxtConfig` options is available on the [NuxtJS documentation website](https://nuxtjs.org/guide/configuration).
