<!--[meta]
section: list-plugins
title: singletoon
[meta]-->

# singleton Plugin

This plugin makes a list singleton by allowing only one item in the list. Useful for list which must contain only one items.

## Usage

```js
const { singleton } = require('@keystonejs/list-plugins');

keystone.createList('ListWithPlugin', {
  fields: {...},
  plugins: [
    singleton({...}),
  ],
});
```

## Config

| Option          | Type      | Default | Description                                       |
| --------------- | --------- | ------- | ------------------------------------------------- |
| `preventDelete` | `Boolean` | `true`  | Prevents deletion of the (only) item in the list. |

### `preventDelete`

By default the plugin will prevent deletion of the only item in the list by setting `delete` access to false. If you want to control the access yourself, set this value to false.

```javascript allowCopy=false showLanguage=false
keystone.createList('ListWithPlugin', {
  fields: {...},
  plugins: [
    singleton({ preventDelete: false }),
  ],
});
```
