---
'@keystone-next/keystone': major
---

The `checkbox` field is now non-nullable, only allows static default values and defaults to `false`. `graphql.isNonNull` can also be set if you have no read access control and you don't intend to add any in the future, it will make the GraphQL output field non-nullable.
