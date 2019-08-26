<!--[meta]
section: api
subSection: field-types
title: Float
[meta]-->

# Float

## Usage

```js
keystone.createList('SensorReading', {
  fields: {
    loggedAt: { type: DateTime, isRequired: true },
    temperature: { type: Float, isRequired: true },
    humidity: { type: Float },
  },
});
```

### Config

| Option       | Type      | Default | Description                                                     |
| ------------ | --------- | ------- | --------------------------------------------------------------- |
| `isRequired` | `Boolean` | `false` | Does this field require a value?                                |
| `isUnique`   | `Boolean` | `false` | Adds a unique index that allows only unique values to be stored |

---
