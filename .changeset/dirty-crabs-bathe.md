---
'@keystone-next/keystone': major
---

In the `text` field, `defaultValue` is now a static value, `isRequired` has moved to `validation.isRequired` and also requires that the value has a length of at least one, along with new `validation.lenght.min`, `validation.length.max` and `validation.match` options. The `text` field is also now non-nullable at the database-level by default and can be made nullable by setting the `db.isNullable` option to `true`. `graphql.read.isNonNull` can also be set if the field does not have `db.isNullable: true` and you have no read access control and you don't intend to add any in the future, it will make the GraphQL output field non-nullable. `graphql.create.isNonNull` can also be set if you have no create access control and you don't intend to add any in the future, it will make the GraphQL create input field non-nullable.
