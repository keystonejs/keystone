<!--[meta]
section: list-plugins
title: byTracking
[meta]-->

# byTracking Plugin

Add `createdBy` and `updatedBy` fields to a list. These fields are read-only but
they will be updated automatically when items are created or updated.

## Usage

```js
const { byTracking } = require('@keystonejs/list-plugins');

keystone.createList('ListWithPlugin', {
  fields: {...},
  plugins: [
    byTracking({...}),
  ],
});
```

## Config

| Option           | Type     | Default     | Description                                          |
| ---------------- | -------- | ----------- | ---------------------------------------------------- |
| `createdByField` | `String` | `createdBy` | Name of the `createdBy` field.                       |
| `updatedByField` | `String` | `updatedBy` | Name of the `updatedBy` field.                       |
| `ref`            | `String` | `User`      | A reference to the list authenticated items (users). |
| `access`         | `Object` | See: access | Change default access controls.                      |

### `access`

By default access control on at tracking fields is read only:

```javascript allowCopy=false showLanguage=false
{
  read: true,
  create: false,
  update: false
}
```

## Granular control

If you prefer, you can import _either_ `createdBy` or `updatedBy` to apply a single tracking field:

```javascript
const { createdBy, updatedBy } = require('@keystonejs/list-plugins');
```

> **Note:** The API is the same for each export as `byTracking`.
