<!--[meta]
section: api
subSection: field-types
title: Decimal
[meta]-->

# Decimal

## GraphQL

Since `Decimal` values can't be represented in JavaScript (or JSON) they are transmitted using the `String` type.

### Input fields

| Field name | Type     | Description            |
| ---------- | -------- | ---------------------- |
| `${path}`  | `String` | The value to be stored |

### Output fields

| Field name | Type     | Description      |
| ---------- | -------- | ---------------- |
| `${path}`  | `String` | The value stored |

### Filters

Despite being specified as strings, all comparisons are performed on _numerical equivalence_.
In essence, this means leading and trailing zeros are ignored.
Eg. `04.53000 === 4.53`.

| Field name       | Type       | Description                                      |
| ---------------- | ---------- | ------------------------------------------------ |
| `${path}`        | `String`   | Equivalent to the value provided                 |
| `${path}_not`    | `String`   | Not equivalent to the value provided             |
| `${path}_in`     | `[String]` | In the array provided                            |
| `${path}_not_in` | `[String]` | Not in the array provided                        |
| `${path}_lt`     | `String`   | Less than the value provided                     |
| `${path}_lte`    | `String`   | Less than or equivalent to the value provided    |
| `${path}_gt`     | `String`   | Greater than the value provided                  |
| `${path}_gte`    | `String`   | Greater than or equivalent to the value provided |

### Prisma adapter

The Prisma adapter uses the [Decimal prisma type](https://www.prisma.io/docs/concepts/components/preview-features/native-types/native-types-mappings#decimal).

The Prisma field adapter supports two additional config options:

| Option      | Type                | Default | Description                                                                                             |
| ----------- | ------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `precision` | `Integer` or `null` | `18`    | The number of significant decimal digits stored                                                         |
| `scale`     | `Integer` or `null` | `4`     | The number of significant fractional decimal digits stored (ie. on the right side of the decimal place) |

If specified `scale` must be greater than `precision`.

> **Note:** The Decimal field type in Prisma is still considered a preview feature, and should not be used in production.
