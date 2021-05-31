---
'@keystone-next/keystone': major
'@keystone-next/types': major
'@keystone-next/auth': patch
---

Removed the `keystone` argument from the `ExtendGraphqlSchema` type. This will only impact you if you were directly constructing this function. Users of the `graphQLSchemaExtension` function will not be impacted.
