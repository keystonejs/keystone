---
'@keystone-next/keystone': patch
---

Updated `context.graphql.raw` and `context.graphql.run` to use the GraphQL function `graphql` rather than `execute`. This function performs more rigorous query validation before executing the query.
