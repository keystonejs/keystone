<!--[meta]
section: field-types
title: DateTime
[meta]-->

# DateTime

## Usage

```js
keystone.createList('User', {
  fields: {
    email: { type: Text },
    password: { type: Password },
    lastOnline: {
      type: DateTime,
      format: 'MM/DD/YYYY h:mm A',
      yearRangeFrom: 1901,
      yearRangeTo: 2018,
      yearPickerType: 'auto',
    },
  },
});
```

### Config

| Option           | Type     | Default                | Description                                                                |
| ---------------- | -------- | ---------------------- | -------------------------------------------------------------------------- |
| `format`         | `String` | `--`                   | Defines the format of string that the component generates                  |
| `yearRangeFrom`  | `String` | The current year - 100 | Defines the starting point of the year range, eg `1918`                    |
| `yearRangeTo`    | `String` | The current year       | Defines the ending point of the range in the yearSelect field , e.g `2018` |
| `yearPickerType` | `String` | `auto`                 | Defines the input type for the year selector                               |

#### `format`

Defines the format of string that the component generates. For example, `MM/DD/YYYY h:mm A`.

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
| `select` | Generates a drop-down menu that allows the user to select a value from a list           |
| `auto`   | Will generate a `select` if the range is 50 or less, otherwise will generate an `input` |
