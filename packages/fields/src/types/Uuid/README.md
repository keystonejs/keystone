<!--[meta]
section: api
subSection: field-types
title: Uuid
[meta]-->

# Uuid

The `Uuid` field type stores Universally Unique Identifiers (UUIDs).
UUIDs are 128-bit numbers but they're often represented in hexadecimal using the format `00000000-0000-0000-0000-000000000000`.
Here we refer to this encoding as the `8-4-4-4-12` hex format.

The encoding used for storage differs by DB adapter, see the [Storage section](#storage).

## Usage

```js
const { Uuid, Text } = require('@keystonejs/fields');

keystone.createList('Products', {
  fields: {
    name: { type: Text },
    supplierId: { type: Uuid, caseTo: 'upper' },
  },
});
```

## Config

| Option       | Type      | Default   | Description                                                                                                                                                                                                                                                       |
| :----------- | :-------- | :-------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `caseTo`     | `String`  | `'lower'` | Force the hex representation of IDs to upper or lower case when being read or written. Valid values: `'lower'`, `'upper'` or `null` for no conversion. Defaults to `'lower'` as per [RFC 4122](https://tools.ietf.org/html/rfc4122). See also: [Casing](#casing). |
| `isRequired` | `Boolean` | `false`   | Does this field require a value?                                                                                                                                                                                                                                  |
| `isUnique`   | `Boolean` | `false`   | Adds a unique index that allows only unique values to be stored                                                                                                                                                                                                   |

## GraphQL

`Uuid` fields use the `ID` type in GraphQL.

### Input fields

| Field name | Type | Description                         |
| :--------- | :--- | :---------------------------------- |
| `${path}`  | `ID` | UUID in the `8-4-4-4-12` hex format |

### Output fields

| Field name | Type | Description                         |
| :--------- | :--- | :---------------------------------- |
| `${path}`  | `ID` | UUID in the `8-4-4-4-12` hex format |

### Filters

Since `Uuid` fields encode IDs, "text" filters (eg. `contains`, `starts_with`, etc) have been excluded.
Note also that hexadecimal encoding, as used for UUIDs, is case agnostic.
As such, despite the GraphQL `ID` type being encoded as Strings, all `Uuid` filters are effectively case insensitive.
See the the [Casing section](#casing).

| Field name       | Type   | Description                           |
| :--------------- | :----- | :------------------------------------ |
| `${path}`        | `ID`   | Exact match to the ID provided        |
| `${path}_not`    | `ID`   | Not an exact match to the ID provided |
| `${path}_in`     | `[ID]` | In the array of IDs provided          |
| `${path}_not_in` | `[ID]` | Not in the array of IDs provided      |

## Storage

### Mongoose adapter

When storing UUIDs, Mongo [recommends BSON objects are used](https://docs.mongodb.com/manual/reference/method/UUID/).
The BSON spec indicates subtype `0x04` specifically.
However most tools (including GraphQL) expect IDs to be encoded as strings and, for UUIDs, specifically expect the `8-4-4-4-12` hex format.
Mongoose has no native support for UUIDs and storing them as BSON requires they be manually converted between these formats when being used.
As such this field type does not currently follow the BSON recommendation; instead, the UUID values are stored as Strings.

This is not ideal (PRs welcome).
In additional to not being inefficiently stored, working with UUIDs as Strings potentially causes problems with casing.
See the [Casing section](#casing).

### Knex adapter

The Knex adapter uses the [Knex `uuid` type](https://knexjs.org/#Schema-uuid):

> **Note:** this uses the built-in uuid type in PostgreSQL, and falling back to a char(36) in other databases.

The PostgreSQL `uuid` type is a proper binary representation of the value.
UUIDs in the text/hex format are implicitly cast to the `uuid` type when required so inserts, comparisons, etc. work as intended.

Other databases, such as MySQL do not have a dedicated UUID type.

## Casing

Unless you're on Postgres or MS SQL Server, your DB platform probably doesn't have native support for a UUIDs type.
A string type like `varchar(36)` or `String` will be used instead with values being stored is their `8-4-4-4-12` hex format.
This can cause problems with casing.

Hexadecial itself is case agnostic.
The hex value `AF3D` is identical to the hex value `af3d`; they both encode the same value as `44861` in decimal and `1010111100111101` in binary.
However, in JavaScript, Mongo and (depending on your configuration) some other DB platforms, the _String_ `'AF3D'` does not equal the string `'af3d'`.

For this field type, we mitigate this problem using the [`caseTo` config option](#config).
This can be used to force the case of your values (to upper or lower case) whenever they're read, written or compared.
This defaults to `'lower'` as per [the UUID spec](https://tools.ietf.org/html/rfc4122).
