<!--[meta]
section: api
subSection: field-types
title: Checkbox
[meta]-->

# Checkbox

The `Checkbox` field type stores a single Boolean value.

## Usage

```js
const { Checkbox, Text } = require('@keystonejs/fields');

keystone.createList('Products', {
  fields: {
    name: { type: Text },
    isEnabled: { type: Checkbox, isRequired: true },
  },
});
```

### Config

| Option       | Type      | Default | Description                      |
| :----------- | :-------- | :------ | :------------------------------- |
| `isRequired` | `Boolean` | `false` | Does this field require a value? |

The `Checkbox` field type doesn't support indexes or unique enforcement.

## GraphQL

`Uuid` fields use the `Boolean` type in GraphQL.

### Input fields

| Field name | Type      | Description            |
| :--------- | :-------- | :--------------------- |
| `${path}`  | `Boolean` | The value to be stored |

### Output fields

| Field name | Type      | Description      |
| :--------- | :-------- | :--------------- |
| `${path}`  | `Boolean` | The stored value |

### Filters

| Field name    | Type | Description                     |
| :------------ | :--- | :------------------------------ |
| `${path}`     | `ID` | Matching the value provided     |
| `${path}_not` | `ID` | Not matching the value provided |

## Storage

### Mongoose adapter

In Mongoose the field is added using the `Boolean` schema type.

The `isRequired` config option is enforces by KeystoneJS only.

### Knex adapter

The Knex adapter uses the [Knex `boolean` type](https://knexjs.org/#Schema-boolean):

The `isRequired` config option is enforces by KeystoneJS and, if equal to `true`, the column is set as not nullable.
