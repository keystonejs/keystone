---
'@keystonejs/server-side-graphql-client': minor
'@keystonejs/keystone': patch
---

- Added a function `gqlNames(listKey)` to the `context` object created by `keystone.createContext`  This allows extracting graphQL query and mutation names from the `context` object.
- Made the `keystone` argument optional when a `context` value is provided in any of the utility functions in `server-side-graphql-client` package.
