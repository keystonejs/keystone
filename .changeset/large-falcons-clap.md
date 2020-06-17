---
'@keystonejs/keystone': patch
---

Added deprecation warnings for `keystone.executeQuery`, `{ actions: { query } }` in hooks, and the `query` argument in custom query and mutation resolvers. These are being deprecated in favour of `keystone.executeGraphQL()` and `context.executeGraphQL()`. See [the docs](docs/discussions/server-side-graphql.md) for more details.
