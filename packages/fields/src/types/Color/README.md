<!--[meta]
section: api
subSection: field-types
title: Color
[meta]-->

# Color

## Usage

```js
const { Color } = require('@keystonejs/fields');

keystone.createList('Product', {
  fields: {
    heroColor: { type: Color },
  },
});
```

## Config

| Option       | Type      | Default | Description                                                     |
| ------------ | --------- | ------- | --------------------------------------------------------------- |
| `isRequired` | `Boolean` | `false` | Does this field require a value?                                |
| `isUnique`   | `Boolean` | `false` | Adds a unique index that allows only unique values to be stored |
