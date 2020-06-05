---
'@keystonejs/keystone': major
---

Prevented parsing the GraphQL schema twice.
- `keystone.getTypeDefs` now returns the parsed GraphQL AST instead of the raw SDL.
- `keystone.dumpSchema` now returns the GraphQL schema as a string instead of writing it to file. Additionally, its first `file` argument was removed and now only takes a the schema name, which defaults to `public`.
