<!--[meta]
section: api
subSection: field-types
title: DateTimeUtc
[meta]-->

# DateTimeUtc

`DateTimeUtc` fields represent points in time.

Accepts only values that include an offset, explicitly or implicitly (as in JS `Date` objects).
Produces JS `Date` objects and ISO 8601 strings.

Unlike the core `DateTime` field type only the UTC value is stored.

## Usage

```js
keystone.createList('User', {
  fields: {
    lastOnline: { type: DateTimeUtc },
  },
});
```
