<!--[meta]
section: api
subSection: field-types
title: Integer
[meta]-->

# Integer

A whole number.

## Usage

```js
const { Integer, Text } = require('@keystonejs/fields');

keystone.createList('Review', {
  fields: {
    comments: { type: Text },
    rating: { type: Integer },
  },
});
```

### Config

| Option       | Type      | Default | Description                                                     |
| ------------ | --------- | ------- | --------------------------------------------------------------- |
| `isRequired` | `Boolean` | `false` | Does this field require a value?                                |
| `isUnique`   | `Boolean` | `false` | Adds a unique index that allows only unique values to be stored |
