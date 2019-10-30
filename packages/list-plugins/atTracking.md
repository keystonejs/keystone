<!--[meta]
section: list-plugins
title: atTracking
[meta]-->

# atTracking

Adds `createdAt` and `updatedAt` fields to a list. These fields are read-only by will be updated automatically when items are created or updated.

## Usage

```js
const { atTracking } = require('@keystonejs/list-plugins');

keystone.createList('ListWithPlugin', {
  fields: {
    // ...
  },
  plugins: [
    atTracking({
      /* ...config */
    }),
  ],
});
```

## Config

| Option           | Type     | Default             | Description                               |
| ---------------- | -------- | ------------------- | ----------------------------------------- |
| `createdAtField` | `String` | `createdAt`         | Name of the `createdAt` field.            |
| `updatedAtField` | `String` | `updatedAt`         | Name of the `createdAt` field.            |
| `format`         | `String` | `MM/DD/YYYY h:mm A` | Format of the generated `DateTime` field. |
| `access`         | `Object` | See: access         | Change default access controls.           |

### `access`

By default access control on at tracking fields is read only:

```javascript
{
  read: true,
  create: false,
  update: false
}
```

## Disabling created or updated

You can import _either_ `createdAt` or `updatedAt` to apply a single tracking field:

```javascript
const { createdAt, updatedAt } = require('@keystonejs/list-plugins');
```

_Note_: The API is the same.
