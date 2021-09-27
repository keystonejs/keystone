---
'@keystone-next/keystone': major
---

In the `select` field, `dataType` has been renamed to `type`, `defaultValue` is now a static value and `isRequired` has moved to `validation.isRequired`. The `select` field can also be made non-nullable at the database-level with the `isNullable` option which defaults to `true`. `graphql.read.isNonNull` can also be set if the field has `isNullable: false` and you have no read access control and you don't intend to add any in the future, it will make the GraphQL output field non-nullable. `graphql.create.isNonNull` can also be set if you have no create access control and you don't intend to add any in the future, it will make the GraphQL create input field non-nullable. The `select` can now also be cleared in the Admin UI when `ui.displayMode` is `segmented-control`.
