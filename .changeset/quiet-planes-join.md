---
'@keystone-next/keystone': major
---

In the `integer` field, `defaultValue` is now a static number or `{ kind: 'autoincrement' }`, `isRequired` has moved to `validation.isRequired`, along with new `validation.min` and `validation.max` options. The `integer` field can also be made non-nullable at the database-level with the `db.isNullable` option which defaults to `validation.isRequired ? false : true`. `graphql.read.isNonNull` can also be set if the field is non-nullable in the database and you have no read access control and you don't intend to add any in the future, it will make the GraphQL output field non-nullable. `graphql.create.isNonNull` can also be set if you have no create access control and you don't intend to add any in the future, it will make the GraphQL create input field non-nullable.


The `autoIncrement` field has also been removed, use the integer field with a `defaultValue` of `{ kind: 'autoincrement' }`