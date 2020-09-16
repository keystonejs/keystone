<!--[meta]
section: api
subSection: field-types
title: DateTime
[meta]-->

# DateTime

Stores a point in time and a time zone offset.

## Usage

```js
const { DateTime } = require('@keystonejs/fields');

keystone.createList('User', {
  fields: {
    lastOnline: {
      type: DateTime,
      format: 'dd/MM/yyyy HH:mm O',
      yearRangeFrom: 1901,
      yearRangeTo: 2018,
      yearPickerType: 'auto',
    },
  },
});
```

### Config

| Option           | Type      | Default                | Description                                                                 |
| ---------------- | --------- | ---------------------- | --------------------------------------------------------------------------- |
| `format`         | `String`  | `--`                   | Defines the format of the string that the component generates               |
| `yearRangeFrom`  | `String`  | The current year - 100 | Defines the starting point of the year range, e.g. `1918`                   |
| `yearRangeTo`    | `String`  | The current year       | Defines the ending point of the range in the yearSelect field , e.g. `2018` |
| `yearPickerType` | `String`  | `auto`                 | Defines the input type for the year selector                                |
| `isRequired`     | `Boolean` | `false`                | Does this field require a value?                                            |
| `isUnique`       | `Boolean` | `false`                | Adds a unique index that allows only unique values to be stored             |

#### `format`

Defines the format of the string using unicode tokens. For example, `dd/MM/yyyy HH:mm O`.

[Documentation of all the available tokens on Unicode website](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table)

#### `yearRangeFrom`

The DateTime component includes an input that allows the user to change the current year from a range of options.
This prop allows the user to set the beginning of that range.

The default value for this field is 100 years before the current year.

#### `yearRangeTo`

The DateTime component includes an input that allows the user to change the current year from a range of options.
This prop allows the user to set the end of that range.

The default value for this field is the current year.

#### `yearPickerType`

The DateTime component includes an input that allows the user to change the current year from a range of options. This prop allows the user to change the type of that input.

| Option   | Description                                                                             |
| -------- | --------------------------------------------------------------------------------------- |
| `input`  | Generates an input that allows the user to type in a value                              |
| `select` | Generates a dropdown menu that allows the user to select a value from a list            |
| `auto`   | Will generate a `select` if the range is 50 or less, otherwise will generate an `input` |

## GraphQL

The `DateTime` field type adds a custom scalar `DateTime` and uses it for input and output fields.

## Storage

### Mongoose adapter

On the Mongoose adapter the `DateTime` value is stored across three fields:

| Field name       | Schema type | Description                                        |
| ---------------- | ----------- | -------------------------------------------------- |
| `${path}`        | `String`    | The full timestamp with offset as a ISO8601 string |
| `${path}_utc`    | `Date`      | The timestamp as a native JS-style epoch           |
| `${path}_offset` | `String`    | The offset component as string                     |

The `isRequired` config option is enforces by KeystoneJS only.

### Knex adapter

On the Knex adapter the `DateTime` value is stored across two fields:

| Column name      | Knex type   | Description                    |
| ---------------- | ----------- | ------------------------------ |
| `${path}_utc`    | `timestamp` | The timestamp in UTC           |
| `${path}_offset` | `text`      | The offset component as string |

The `isRequired` config option is enforced by KeystoneJS. If the value is equal to `true`, the column is set as not nullable.
