<!--[meta]
section: api
subSection: field-types
title: CalendarDay
[meta]-->

# CalendarDay

## Usage

```js
const { Text, Password, CalendarDay } = require('@keystonejs/fields');

keystone.createList('User', {
  fields: {
    email: { type: Text },
    password: { type: Password },
    lastOnline: {
      type: CalendarDay,
      format: 'Do MMMM YYYY',
      yearRangeFrom: 1901,
      yearRangeTo: 2018,
    },
  },
});
```

### Config

| Option          | Type      | Default                | Description                                                                   |
| --------------- | --------- | ---------------------- | ----------------------------------------------------------------------------- |
| `format`        | `String`  | `YYYY-MM-DD`           | Defines the format of date string that the will be displayed in the Admin UI. |
| `yearRangeFrom` | `Integer` | The current year - 100 | Defines the starting point of the year range, eg `1918`                       |
| `yearRangeTo`   | `Integer` | The current year       | Defines the ending point of the range in the yearSelect field , e.g `2018`    |
| `isRequired`    | `Boolean` | `false`                | Does this field require a value?                                              |
| `isUnique`      | `Boolean` | `false`                | Adds a unique index that allows only unique values to be stored               |

#### `format`

Defines the format of date string that the will be displayed in the Admin UI.
The Admin UI uses the [`date-fns` v2.x](https://date-fns.org/v2.13.0/docs/format) library for formatting, and any format supported by that library is valid. E.g.

- `yyyy-MM-dd` => "1970-01-31"
- `MM/dd/yyyy` => "01/31/1970"
- `MMM do, yy` => "Jan 31st, 70"

#### `yearRangeFrom`

The CalendarDay component includes an input that allows the user to change the current year from a range of options.
This prop allows the user to set the beginning of that range.

The default value for this field is 100 years before the current year.

#### `yearRangeTo`

The CalendarDay component includes an input that allows the user to change the current year from a range of options.
This prop allows the user to set the end of that range.

The default value for this field is the current year.

## GraphQL

`CalendarDay` fields use the `String` type in GraphQL.
They produce values according to their configured `format` but always expect values in ISO8601 (`YYYY-MM-DD`) format.

### Input fields

| Field name | Type     | Description                                              |
| :--------- | :------- | :------------------------------------------------------- |
| `${path}`  | `String` | The value to be stored, in ISO8601 (`YYYY-MM-DD`) format |

### Output fields

| Field name | Type     | Description                                 |
| :--------- | :------- | :------------------------------------------ |
| `${path}`  | `String` | The stored value in the configured `format` |

### Filters

All filter fields expect values in the ISO8601 (`YYYY-MM-DD`) format.

| Field name       | Type       | Description                                |
| :--------------- | :--------- | :----------------------------------------- |
| `${path}`        | `String`   | Matching the value provided                |
| `${path}_not`    | `String`   | Not matching the value provided            |
| `${path}_in`     | `[String]` | Matching any of the values provided        |
| `${path}_not_in` | `[String]` | Matching none of the values provided       |
| `${path}_lt`     | `String`   | Before than the value provided             |
| `${path}_lte`    | `String`   | Before or equal to the value provided      |
| `${path}_gt`     | `String`   | More recent than the value provided        |
| `${path}_gte`    | `String`   | More recent or equal to the value provided |

## Storage

### Mongoose adapter

In Mongoose the field is added using the `String` schema type.

The `isRequired` config option is enforced by KeystoneJS only.

### Knex adapter

The Knex adapter uses the [Knex `date` type](https://knexjs.org/#Schema-date):

The `isRequired` config option is enforced by KeystoneJS and, if equal to `true`, the column is set as not nullable.
