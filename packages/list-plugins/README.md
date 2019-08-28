<!--[meta]
section: packages
title: List Plugins
[meta]-->

# List Plugins

List Plugins are functions that modify the config object for the List. They take list config as argument and return modified list config.

## At Tracking

This plugin adds tracking for time, time for list item creation and updation can be added. By default they are named as `createdAt` and `updatedAt`.

### API

```js
const { atTracking } = require('@keystone-alpha/list-plugins');
keystone.createList('ListWithPlugin', {
  fields: {
    // ... fields
  },
  plugins: [atTracking()],
});
```

This plugin is split into two helper plugins `createdAt` and `updatedAt` in order to simplify the fields being added. Name of the field can be customized by passing `createdAtField` and `updatedAtField` to `atTracking` plugin or respectively to `createdAt` and `updatedAt` plugin.

Full api usage:

```js
keystone.createList('ListWithPlugin', {
  fields: {
    // ... fields
  },
  plugins: [
    atTracking(),
    createdAt({ createdAtField: 'whenCreated' }),
    updatedAt({ updatedAtField: 'whenUpdated' }),
  ],
});
```

## By Tracking

This plugin adds tracking for author of the item, author for list item creation and updation can be added. By default they are named as `createdBy` and `updatedBy`.

### API

```js
const { byTracking } = require('@keystone-alpha/list-plugins');
keystone.createList('ListWithPlugin', {
  fields: {
    // ... fields
  },
  plugins: [byTracking()],
});
```

This plugin is also split into two helper plugins `createdBy` and `updatedBy` in order to simplify the fields being added. Name of the field can be customized by passing `createdByField` and `updatedByField` to `byTracking` plugin or respectively to `createdBy` and `updatedBy` plugin.

Full api usage:

```js
keystone.createList('ListWithPlugin', {
  fields: {
    // ... fields
  },
  plugins: [
    createdBy(),
    updatedBy(),
    byTracking({
      createdByField: 'creator',
      updatedByField: 'updater',
    }),
  ],
});
```
