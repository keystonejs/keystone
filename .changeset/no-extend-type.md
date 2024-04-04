---
'@keystone-6/core': major
---

Remove `ExtendGraphqlSchema` type alias, use `(schema: GraphQLSchema) => GraphQLSchema` instead (with `import type { GraphQLSchema } from 'graphql'`).
