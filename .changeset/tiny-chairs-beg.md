---
'@keystone-next/keystone': major
---

Updated the way the `endSession` field on the `Mutation` type and the `keystone` field on the `Query` type are added to the GraphQL schema. This may result in re-ordering in your generated `schema.graphql` file. The `sessionSchema` export of `@keystone-next/keystone/session` has also been removed.
