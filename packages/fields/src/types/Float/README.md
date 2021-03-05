<!--[meta]
section: api
subSection: field-types
title: Float
[meta]-->

# Float

An imprecise numeric value, stored as a floating point.

## Usage

```js
const { Float, DateTime } = require('@keystone-next/fields-legacy');

keystone.createList('SensorReading', {
  fields: {
    loggedAt: { type: DateTime },
    temperature: { type: Float },
    humidity: { type: Float },
  },
});
```

### Config

| Option       | Type      | Default | Description                                                     |
| ------------ | --------- | ------- | --------------------------------------------------------------- |
| `isRequired` | `Boolean` | `false` | Does this field require a value?                                |
| `isUnique`   | `Boolean` | `false` | Adds a unique index that allows only unique values to be stored |
