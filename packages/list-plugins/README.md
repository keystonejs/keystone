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

## Custom Tracking (trackingBase)

This base plugin helps create custom tracking for extended use.

Config Options:

`fieldConfig`: [Required] Field config, similar to field as in list schema
`createField`: [Required*] Name of the field for create hook
`createFieldFunc`: [Required*] function to return value for create operation, this function accepts parameters same as resolveInput hook
`updateField`: [Required*] Name of the field for update hook
`updateFieldFunc`: [Required*] function to return value for update operation, this function accepts parameters same as resolveInput hook

> only one of `createField, createFieldFunc` or `updateField, updateFieldFunc` combination is required, both combination can be provided.

### API

Example to track system uptime at the time of create or update of list item

```js
const { uptime } = require('os');
const { trackingBase } = require('@keystone-alpha/list-plugins');
const sysUptimeTracker = trackingBase({
  fieldConfig: {
    type: Text,
  },
  createdField: 'uptimeWhenCreated',
  createFieldFunc: () => uptime(),
  updatedField: 'uptimeWhenUpdated',
  updateFieldFunc: () => uptime(),
});
keystone.createList('ListWithPlugin', {
  fields: {
    // ... fields
  },
  plugins: [sysUptimeTracker],
});
```
