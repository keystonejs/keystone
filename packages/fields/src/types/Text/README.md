<!--[meta]
section: api
subSection: field-types
title: Text
[meta]-->

# Text

A basic but versatile text field of arbitrary length.

## Usage

```js
const { Text } = require('@keystone-next/fields-legacy');

keystone.createList('Product', {
  fields: {
    description: { type: Text },
  },
});
```

## Config

| Option        | Type      | Default | Description                                                     |
| ------------- | --------- | ------- | --------------------------------------------------------------- |
| `isRequired`  | `Boolean` | `false` | Does this field require a value?                                |
| `isUnique`    | `Boolean` | `false` | Adds a unique index that allows only unique values to be stored |
| `isMultiline` | `Boolean` | `false` | Makes the field render as a textarea                            |
