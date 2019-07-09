<!--[meta]
section: field-types
title: CalendarDay
[meta]-->

# CalendarDay

## Usage

```js
keystone.createList('User', {
  fields: {
    email: { type: Text },
    password: { type: Password },
    lastOnline: {
      type: CalendarDay,
      format: 'Do MMMM YYYY',
      yearRangeFrom: 1901,
      yearRangeTo: 2018,
      yearPickerType: 'auto',
    },
  },
});
```

### Config

| Option           | Type      | Default                | Description                                                                |
| ---------------- | --------- | ---------------------- | -------------------------------------------------------------------------- |
| `format`         | `String`  | `YYYY-MM-DD`           | Defines the format of string that the component generates                  |
| `yearRangeFrom`  | `String`  | The current year - 100 | Defines the starting point of the year range, eg `1918`                    |
| `yearRangeTo`    | `String`  | The current year       | Defines the ending point of the range in the yearSelect field , e.g `2018` |
| `yearPickerType` | `String`  | `auto`                 | Defines the input type for the year selector                               |
| `isRequired`     | `Boolean` | `false`                | Does this field require a value?                                           |
| `isUnique`       | `Boolean` | `false`                | Adds a unique index that allows only unique values to be stored            |

#### `format`

Defines the format of string that the component generates. For example, `Do MMMM YYYY`.

#### `yearRangeFrom`

The CalendarDay component includes an input that allows the user to change the current year from a range of options.
This prop allows the user to set the beginning of that range.

The default value for this field is 100 years before the current year.

#### `yearRangeTo`

The CalendarDay component includes an input that allows the user to change the current year from a range of options.
This prop allows the user to set the end of that range.

The default value for this field is the current year.

#### `yearPickerType`

The CalendarDay component includes an input that allows the user to change the current year from a range of options. This prop allows the user to change the type of that input.

| Option   | Description                                                                             |
| -------- | --------------------------------------------------------------------------------------- |
| `input`  | Generates an input that allows the user to type in a value                              |
| `select` | Generates a drop-down menu that allows the user to select a value from a list           |
| `auto`   | Will generate a `select` if the range is 50 or less, otherwise will generate an `input` |

## GraphQL

`CalendarDay` fields use the `String` type in GraphQL.
They produce and values according to their configured `format` but always expect values in ISO8601 (`YYYY-MM-DD`) format.

### Input Fields

| Field name | Type     | Description                                              |
| :--------- | :------- | :------------------------------------------------------- |
| `${path}`  | `String` | The value to be stored, in ISO8601 (`YYYY-MM-DD`) format |

### Output Fields

| Field name | Type      | Description                                 |
| :--------- | :-------- | :------------------------------------------ |
| `${path}`  | `Boolean` | The stored value in the configured `format` |

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

### Mongoose Adaptor

In Mongoose the field is added using the `String` schema type.

The `isRequired` config option is enforces by Keystone only.

### Knex Adaptor

The Knex adaptor uses the [Knex `date` type](https://knexjs.org/#Schema-date):

The `isRequired` config option is enforces by Keystone and, if equal to `true`, the column is set as not nullable.
