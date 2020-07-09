<!--[meta]
section: api
subSection: field-types
title: CalendarDay
[meta]-->

# CalendarDay

Stores an abstract "day" value; like a date but _independant of any time zone_.
Useful for Birthdays and other all-day events always celebrated in the local time zone.

## Usage

```js
const { Text, Password, CalendarDay } = require('@keystonejs/fields');

keystone.createList('User', {
  fields: {
    email: { type: Text },
    password: { type: Password },
    lastOnline: {
      type: CalendarDay,
      dateFrom: '2001-01-16',
      dateTo: '2020-05-20',
    },
  },
});
```

### Config

| Option       | Type      | Default     | Description                                                     |
| ------------ | --------- | ----------- | --------------------------------------------------------------- |
| `dateFrom`   | `String`  | `undefined` | The starting point of the allowable date range.                 |
| `dateTo`     | `String`  | `undefined` | The end point of the allowable date range.                      |
| `isRequired` | `Boolean` | `false`     | Does this field require a value?                                |
| `isUnique`   | `Boolean` | `false`     | Adds a unique index that allows only unique values to be stored |

#### `dateFrom`

The CalendarDay field can enforce selected days to conform to a specific date range. `dateFrom` represents the start of a range and the earliest date that can be selected. `dateFrom` can be provided without a `dateTo` option. However, where a `dateTo` is provided, the `dateFrom` value must be equal to or earlier than the `dateTo` value.

#### `dateTo`

The CalendarDay field can enforce selected days to conform to a specific date range. `datTo` represents the end of a range and the latest date that can be selected. `dateTo` can be provided without a `dateFrom` option. However, where a `dateFrom` value is provided, the `dateTo` value must be equal to or after the `dateFrom` value.

## GraphQL

`CalendarDay` fields use the `String` type in GraphQL.

All date values must be in the 10 character ISO8601 format:`YYYY-MM-DD`.

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
