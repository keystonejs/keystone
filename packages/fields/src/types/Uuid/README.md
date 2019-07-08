<!--[meta]
section: field-types
title: Uuid
[meta]-->

# Uuid

The `Uuid` type stores universally unique identifiers (UUIDs);
128-bit numbers often displayed as hexidecimal in the format `00000000-0000-0000-0000-000000000000`.

> The encoding used for storage differs by DB adapter, see [storage](#storage) below.

## Usage

```js
keystone.createList('Products', {
  fields: {
    name: { type: Text },
    supplierId: { type: Uuid, caseTo: 'upper' },
    // ...
  },
});
```


// TODO: Build out the Mongo field adapter using the binary subtype (0x04)
// We don't want to use strings because strings are case sensitive.
// Even though we often pass UUIDs around in the `8-4-4-4-12` format, this is hex and
// so stirng based equality comparisons will fail us. See also...
//  - https://studio3t.com/knowledge-base/articles/mongodb-best-practices-uuid-data/#mongodb-best-practices
//  - https://medium.com/@cdimascio/uuids-with-mongodb-and-node-js-d4a8a188344b



### Config

| Option   | Type     | Default   | Description                                                                                                                                                |
|:---------|:---------|:----------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `caseTo` | `String` | `'lower'` | Force the hex representation of IDs to upper or lower case when being read or written. <br>Valid values: `'upper'`, `'lower'` or `null` for no conversion. |

## GraphQL


### Input Fields


### Output Fields


### Sort Options


### Filters



Storage
   Mongoose Adaptor
   Knex Adaptor

----


## Usage

```js
keystone.createList('User', {
  fields: {
    email: { type: Text },
    password: { type: Password },
    // ...
  },
});
```

## GraphQL

`Password` fields are somewhat unusual in that they can be written to but not read.

### Input Fields

`Password` fields at a `String` field to both create and update GraphQL Input types.

| Field name | Type     | Description            |
| ---------- | -------- | ---------------------- |
| `${path}`  | `String` | The value to be hashed |

### Output Fields

In normal usage, hash values should not be externally accessible.
As such `Password` fields do _not_ add a `String` output field.

| Field name       | Type      | Description                    |
| ---------------- | --------- | ------------------------------ |
| `${path}_is_set` | `Boolean` | Does this field contain a hash |

### Filters

| Field name       | Type      | Description                    |
| ---------------- | --------- | ------------------------------ |
| `${path}_is_set` | `Boolean` | Does this field contain a hash |

## Storage

### Mongoose Adaptor

The hash value is stored at `${path}`.
All filters supported.

### Knex Adaptor

**Not yet supported**

Value will be stored in a `text` fields.

