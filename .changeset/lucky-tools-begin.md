---
'@keystone-next/keystone': major
---

In the `timestamp` field, `defaultValue` is now a static date time value in an ISO8601 string or `{ kind: 'now' }` and `isRequired` has moved to `validation.isRequired`. The `timestamp` field can also be made non-nullable at the database-level with the `isNullable` option which defaults to `true`. `graphql.read.isNonNull` can also be set if the field has `isNullable: false` and you have no read access control and you don't intend to add any in the future, it will make the GraphQL output field non-nullable. `graphql.create.isNonNull` can also be set if you have no create access control and you don't intend to add any in the future, it will make the GraphQL create input field non-nullable. The field can also be automatically set to the current time on a create/update by setting `db.updatedAt: true`, this will add Prisma's `@updatedAt` attribute to the field.
