<!--[meta]
section: field-types
title: Decimal
[meta]-->

# Decimal

## Usage

```js
keystone.createList('Payment', {
  fields: {
    timestamp: { type: DateTime, isRequired: true },
    description: { type: Text },
    amount: { type: Decimal, isRequired: true },
  },
});
```

### Config

| Option       | Type      | Default | Description                                                     |
| ------------ | --------- | ------- | --------------------------------------------------------------- |
| `isRequired` | `Boolean` | `false` | Does this field require a value?                                |
| `isUnique`   | `Boolean` | `false` | Adds a unique index that allows only unique values to be stored |

---

```DOCS_TODO
TODO
```
