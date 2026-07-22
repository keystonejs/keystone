---
"@keystone-6/core": minor
---

Adds `access.operation.query.one`, `access.operation.query.many`, and `access.operation.query.count` for access control for specific kinds of queries. The `access.operation.query` functions also receive `kind: 'one' | 'many' | 'count'`. Specific kinds of queries can be omitted from the GraphQL schema through `graphql.omit.query.one`, `graphql.omit.query.many`, and `graphql.omit.query.count`.