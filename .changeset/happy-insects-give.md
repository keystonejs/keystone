---
'@keystone-next/example-auth': patch
'@keystone-next/examples-app-basic': patch
'@keystone-next/example-ecommerce': patch
'keystone-next-app': patch
'@keystone-next/example-roles': patch
'@keystone-next/example-extend-graphql-schema': patch
'@keystone-next/example-testing': patch
'@keystone-next/example-with-auth': patch
'@keystone-next/auth': patch
'@keystone-next/keystone': patch
---

Updated dependencies to use `mergeSchemas` from `@graphql-tools/schema`, rather than its old location in `@graphql-tools/merge`. You might see a reordering of the contents of your `graphql.schema` file.
