---
'@keystonejs/app-graphql': major
'@keystonejs/keystone': major
---

Replaced `keystone.getGraphQlContext()` with `keystone.createHTTPContext()`, to be used primarily by the Apollo server.
If you need to create a context for executing server-side GraphQL operations please use `keystone.createContext()`.
See [the docs](/docs/discussions/server-side-graphql.md) for more details on how to use `keystone.createContext()`.
