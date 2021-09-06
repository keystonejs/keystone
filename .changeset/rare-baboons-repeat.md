---
'@keystone-next/keystone': major
---

The `checkbox` field is now non-nullable, if you need three states, you should use `select()`. The field also only allows static default values and defaults to `false`. `graphql.isNonNull` can also be set if you have no read access control and you don't intend to add any in the future, it will make the GraphQL output field non-nullable.
