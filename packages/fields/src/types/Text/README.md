<!--[meta]
section: api
subSection: field-types
title: Text
[meta]-->

# Text

## Usage

```js
keystone.createList('Product', {
  fields: {
    description: { type: Text },
    // ...
  },
});
```

### Config

| Option       | Type      | Default | Description                                                     |
| ------------ | --------- | ------- | --------------------------------------------------------------- |
| `isRequired` | `Boolean` | `false` | Does this field require a value?                                |
| `isUnique`   | `Boolean` | `false` | Adds a unique index that allows only unique values to be stored |
