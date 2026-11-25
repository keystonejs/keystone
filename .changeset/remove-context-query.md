---
'@keystone-6/core': major
---

Removes `context.query` from `KeystoneContext`. Use `context.graphql.run` with a complete GraphQL operation to select GraphQL fields, or `context.db` to work with database items.
