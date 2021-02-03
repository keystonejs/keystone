<!--[meta]
section: api
subSection: field-types
title: Decimal
[meta]-->

# Decimal

`Decimal` fields store exact numeric values.
They're safe for base-10 fractional value like currency.

There are some differences in underlying implementation, depending on your DB adapter.
See the [Storage section](#storage) for specifics.

## Usage

```js
const { DateTime, Decimal, Text } = require('@keystonejs/fields');

keystone.createList('Payment', {
  fields: {
    timestamp: { type: DateTime },
    description: { type: Text },
    amount: { type: Decimal },
  },
});
```

### Config

| Option        | Type      | Default | Description                                                         |
| ------------- | --------- | ------- | ------------------------------------------------------------------- |
| `isRequired`  | `Boolean` | `false` | Does this field require a value?                                    |
| `isUnique`    | `Boolean` | `false` | Adds a unique index that allows only unique values to be stored     |
| `knexOptions` | `Object`  | `{}`    | Optional; see the [Knex Adapter](#knex-adapter) section for details |

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

## Storage

Although their intent is the same, the core DB adapters use different underlying implementations of this type.

### Mongoose adapter

Values are stored using the [Mongoose `Decimal128` SchemaType](https://mongoosejs.com/docs/api.html#mongoose_Mongoose-Decimal128)
which in turn uses the underlying [Decimal128 BSON type](https://metacpan.org/pod/BSON::Decimal128).

The `Decimal128` standard is..

> a decimal floating-point computer numbering format that occupies 16 bytes (128 bits) in computer memory.
> It is intended for applications where it is necessary to emulate decimal rounding exactly, such as financial and tax computations.

\-- [decimal128 floating-point format on Wikipedia](https://en.wikipedia.org/wiki/Decimal128_floating-point_format)

### Knex adapter

The Knex adapter uses the [decimal schema type](https://knexjs.org/#Schema-decimal)
which maps directly to underlying `Decimal` or `Numeric` types in most DB platforms.

Usually, in a relational DB, `Decimal` fields have a fixed precision.
As such, the Knex field adapter supports two additional config options:

| Option      | Type                | Default | Description                                                                                             |
| ----------- | ------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `precision` | `Integer` or `null` | `18`    | The number of significant decimal digits stored                                                         |
| `scale`     | `Integer` or `null` | `4`     | The number of significant fractional decimal digits stored (ie. on the right side of the decimal place) |

If specified `scale` must be greater than `precision`.

#### Non-fixed precision

Some DB platforms (Oracle, SQLite and Postgres) support `Decimal` types without a fixed precision.
This can be configured by passing both the `precision` and `scale` as `null`, eg:

```js
keystone.createList('Currency', {
  fields: {
    name: { type: Text },
    totalIssued: { type: Decimal, knexOptions: { precision: null, scale: null } },
  },
});
```

Will produce:

```sql
CREATE TABLE keystone."Currency" (
    id integer DEFAULT nextval('keystone."Currency_id_seq"'::regclass) PRIMARY KEY,
    name text,
    "totalIssued" numeric
);
```

### Prisma adapter

The Prisma adapter uses the [Decimal prisma type](https://www.prisma.io/docs/concepts/components/preview-features/native-types/native-types-mappings#decimal).

The Prisma field adapter supports two additional config options:

| Option      | Type                | Default | Description                                                                                             |
| ----------- | ------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `precision` | `Integer` or `null` | `18`    | The number of significant decimal digits stored                                                         |
| `scale`     | `Integer` or `null` | `4`     | The number of significant fractional decimal digits stored (ie. on the right side of the decimal place) |

If specified `scale` must be greater than `precision`.

> **Note:** The Decimal field type in Prisma is still considered a preview feature, and should not be used in production.
