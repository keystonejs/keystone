---
'@keystone-next/keystone': major
---

The `checkbox` field is now non-nullable, if you need three states, you should use `select()`. The field no longer accepts dynamic default values and it will default to `false` unless a different `defaultValue` is specified. When migrating, Prisma will generate a migration that sets any checkbox fields to `false`, unless you change the default value. `graphql.isNonNull` can also be set if you have no read access control and you don't intend to add any in the future, it will make the GraphQL output field non-nullable.
