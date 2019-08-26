<!--[meta]
section: api
subSection: field-types
title: Select
[meta]-->

# Select

## Usage

```js
keystone.createList('Orders', {
  fields: {
    status: { type: Select, options: 'pending, processed' },
  },
});
```

### Config

| Option       | Type      | Default | Description                                                             |
| ------------ | --------- | ------- | ----------------------------------------------------------------------- |
| `options`    | \*        | `null`  | Defines the values (and labels) that can be be selected from, see below |
| `isRequired` | `Boolean` | `false` | Does this field require a value?                                        |
| `isUnique`   | `Boolean` | `false` | Adds a unique index that allows only unique values to be stored         |

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
