<!--[meta]
section: api
subSection: field-types
title: Email
[meta]-->

# Email

The `Email` field type is similar to the `Text` field, but it will validate against non valid email addresses

## Usage

```js
const { Email } = require('@keystonejs/fields');

keystone.createList('User', {
  fields: {
    email: { type: Email },
  },
});
```

## Config

| Option       | Type      | Default | Description                                                     |
| ------------ | --------- | ------- | --------------------------------------------------------------- |
| `isRequired` | `Boolean` | `false` | Does this field require a value?                                |
| `isUnique`   | `Boolean` | `false` | Adds a unique index that allows only unique values to be stored |
