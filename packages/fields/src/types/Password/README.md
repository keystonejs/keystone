---
section: field-types
title: Password
---

# Password

`Password` fields are unusual in that they do not store the value they are supplied.
The value is run through the `bcrypt` algorithm to generate a hash which is stored instead.

[`bcrypt`](https://en.wikipedia.org/wiki/Bcrypt)
is a one-way, cryptographic hash function with build-in salt and a flexible work factor.
It allows a candidate string (eg. a password sent for a login attempt)
to be verified without knowledge of the original value.

> Note: The `bcrypt` algorithm is applied by pre-save hooks on the model.
> Values set to Password fields may be readable by Node until the item has been saved.

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

### Config

| Option         | Type      | Default | Description                                                           |
| -------------- | --------- | ------- | --------------------------------------------------------------------- |
| `minLength`    | `Integer` | `8`     | The minimum number of characters this field will accept               |
| `rejectCommon` | `Boolean` | `false` | Checks the password against a list of commonly used passwords         |
| `workFactor`   | `Integer` | `10`    | Controls the processing time required to generate and validate hashes |

#### `minLength`

The minimum number of characters this field will accept.

`minLength` must be greater than or equal to 1.
Zero-length values can be suppled for a Password field but they will not be hashed;
instead the stored value will be set to `null`.

The length of supplied values is evaluated using `String().length`.
Due to [JavaScript's Unicode problem](https://mathiasbynens.be/notes/javascript-unicode),
this does not account well for multibyte characters (such as some emoji),
multi-code-point glyphs and other Unicode magic.

If a value is supplied that fails to fulfil the minimum length an error will be thrown.
The error message will contain the string `[password:minLength:${listKey}:${fieldPath}]`.

#### `rejectCommon`

Values are checked against a list of 10,000 common passwords as
[compiled by Mark Burnett](https://xato.net/10-000-top-passwords-6d6380716fe0).
You should strongly consider enabling this feature in accordance with the
[NIST Digital Identity Guidelines](http://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63b.pdf).

When enable, if a a known-common password is supplied, an error will be thrown.
The error message will contain the string `[password:rejectCommon:${listKey}:${fieldPath}]`.

#### `workFactor`

Supplied as the bcrypt cost parameter; controls the computational cost of both creating and validating a hash.
The value supplied should be between 4 and 31 (lower/higher values will be limited to this range).
The default value is 10.

Higher values are slower but, since they take longer to generate, more secure against brute force attacks.
The default value of 10 will allow the generation of a several hashes per second, per core, on most machines.

Note the `workFactor` supplied is applied by the bcrypt algorithm as an exponent of 2.
As such, a work factor of 11 will cause passwords to take _twice_ as long to hash and validate as a work factor of 10.
A work factor of 12 will cause passwords to take _four times_ as long as 10. Etc.

### Auth Strategies

The `Password` field exposes a `compare()` function.
This allows `Password` fields to be specified as a `secretField` when configuring a `PasswordAuthStrategy`.
See the [Authentication docs](https://github.com/keystonejs/keystone-5/blob/master/docs/authentication.md) for details.

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
