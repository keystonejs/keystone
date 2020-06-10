<!--[meta]
section: api
subSection: field-types
title: MongoId
[meta]-->

# MongoId

This field allows arbitrary Mongo `ObjectId` fields to be added to your lists.

It supports the core Mongoose and Knex adapters:

- On Mongoose the [native Mongo `ObjectId` schema type](https://mongoosejs.com/docs/schematypes.html#objectids) is used.
- On Knex a 24 character [string field](https://knexjs.org/#Schema-string) is added to the schema.
  This resolves down to `varchar(24)`, `character varying(24)` or similar, depending on the underlying DB platform.
  Values stored are forced to lowercase on read and write to avoid issues with case-sensitive string comparisons.
  See the [casing section](#casing) for details.

## Usage

```js
const { Keystone } = require('@keystonejs/keystone');
const { MongoId } = require('@keystonejs/fields-mongoid');

const keystone = new Keystone(/* ... */);

keystone.createList('Product', {
  fields: {
    name: { type: Text },
    oldId: { type: MongoId },
    // ...
  },
});
```

### Config

| Option       | Type      | Default | Description                                                     |
| :----------- | :-------- | :------ | :-------------------------------------------------------------- |
| `isRequired` | `Boolean` | `false` | Does this field require a value?                                |
| `isUnique`   | `Boolean` | `false` | Adds a unique index that allows only unique values to be stored |

## Admin UI

We reuse the interface implementation from the native `Text` field.

## GraphQL

`MongoId` fields use the `ID` type in GraphQL.

### Input fields

| Field name | Type | Description                              |
| :--------- | :--- | :--------------------------------------- |
| `${path}`  | `ID` | The ID in its 24 char hex representation |

### Output fields

| Field name | Type | Description                              |
| :--------- | :--- | :--------------------------------------- |
| `${path}`  | `ID` | The ID in its 24 char hex representation |

### Filters

Since `MongoId` fields encode identifiers, "text" filters (eg. `contains`, `starts_with`, etc) are not supported.
Note also that hexadecimal encoding, as used here, is case agnostic.
As such, despite the GraphQL `ID` type being encoded as Strings, all `MongoId` filters are effectively case insensitive.
See the the [Casing section](#casing).

| Field name       | Type   | Description                           |
| :--------------- | :----- | :------------------------------------ |
| `${path}`        | `ID`   | Exact match to the ID provided        |
| `${path}_not`    | `ID`   | Not an exact match to the ID provided |
| `${path}_in`     | `[ID]` | In the array of IDs provided          |
| `${path}_not_in` | `[ID]` | Not in the array of IDs provided      |

## Storage

### Mongoose adapter

The Mongoose adapter uses the [native Mongo `ObjectId` schema type](https://mongoosejs.com/docs/schematypes.html#objectids).
Internally, the 12-byte value are stored in a binary format.
Mongoose automatically and transparently converts to and from the 24 char hexadecimal representation when reading and writing.

### Knex Adapter

The Knex adapter adds 24 character [string field](https://knexjs.org/#Schema-string) to the schema.
This resolves down to `varchar(24)`, `character varying(24)` or similar, depending on the underlying DB platform.

Values stored are forced to lowercase on read and write to avoid issues with case-sensitive string comparisons.
See the [casing section](#casing) for details.

The field adapter supplied for Knex supports
[the `isNotNullable` and `defaultTo` options](https://github.com/keystonejs/keystone/pull/1383#issuecomment-509889242).

## Casing

Mongo ObjectIDs are usually passed around in a hexadecimal string representation.
Hexadecimal itself is case agnostic; the hex value `AF3D` is identical to the hex value `af3d`
(they encode the same value as decimal `44861` or binary `1010111100111101`).
However, JavaScript and (depending on your configuration) some DB platforms are case-sensitive;
in these contexts, the string `'AF3D'` _does not equal_ the string `'af3d'`.

For the `MongoId` type, we mitigate this problem by forcing values to lowercase when using the Knex adapter.

Similar issues are faced by the
[core `Uuid` field type](https://github.com/keystonejs/keystone/tree/master/packages/fields/src/types/Uuid#casing).
It is also often represented using hexadecimal within a string.
