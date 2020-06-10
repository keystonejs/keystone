<!--[meta]
section: api
subSection: field-types
title: Select
[meta]-->

# Select

Stores one of several predefined string values.
Presented as a dropdown in the Admin UI.

## Usage

```js
const { Select } = require('@keystonejs/fields');

keystone.createList('Orders', {
  fields: {
    status: { type: Select, options: 'pending, processed' },
  },
});
```

## Config

| Option       | Type        | Default | Description                                                                                 |
| ------------ | ----------- | ------- | ------------------------------------------------------------------------------------------- |
| `options`    | (see below) | `null`  | Defines the values (and labels) that can be be selected from, see below                     |
| `dataType`   | `String`    | `enum`  | Controls the data type stored in the database, and defined in the GraphQL schema, see below |
| `isRequired` | `Boolean`   | `false` | Does this field require a value?                                                            |
| `isUnique`   | `Boolean`   | `false` | Adds a unique index that allows only unique values to be stored                             |

### `options`

The `options` config can be supplied as either:

- A comma-separates list of values, eg: `'Pending, Processed, Errored'`
- An array of strings, eg: `['ready', 'sent', 'deleted']`
- An array of objects, each specifying an `value` and `label`, eg:

```js
const options = [
  { value: 'YES', label: "Yes, I'll be there!" },
  { value: 'NO', label: "Sorry, I can't make it :(" },
  { value: 'MAYBE', label: 'Not sure yet' },
];

keystone.createList('Rsvp', {
  fields: {
    attending: { type: Select, options },
    // ..
  },
});
```

### `dataType`

The Select field can store its value as any of the three following types:

- `enum` (stored as a string in MongoDB)
- `string`
- `integer`

The dataType will also affect the type definition for the GraphQL Schema.

While `enum` is the default, and allows GraphQL to hint and validate input for the field, it also has a limited format for option values. If you want to store values starting with a number, or containing spaces, dashes and other special characters, consider using the `string` dataType.

The following example is not valid:

```js
// invalid enum options
const options = [
  { value: 'just one', label: 'Just One' },
  { value: '<10', label: 'Less than Ten' },
  { value: '100s', label: 'Hundreds' },
];

keystone.createList('Things', {
  fields: {
    scale: { type: Select, options },
  },
});
```

Specifying the `string` dataType will work:

```js
keystone.createList('Things', {
  fields: {
    scale: { type: Select, options, dataType: 'string' },
  },
});
```

If you use the `integer` dataType, options must be provided as integers, so you can't use the shorthand syntax for defining options.

```js
keystone.createList('Things', {
  fields: {
    number: { type: Select, options: '1, 2, 3', dataType: 'integer' },
  },
});
```

Use the full syntax instead, and provide the values as numbers:

```js
const options = [
  { value: 1, label: 'One' },
  { value: 2, label: 'Two' },
  { value: 3, label: 'Three' },
];

keystone.createList('Things', {
  fields: {
    number: { type: Select, options: options, dataType: 'integer' },
  },
});
```
