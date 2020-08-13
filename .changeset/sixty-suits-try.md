---
'@keystonejs/test-utils': major
---

- Removed some of the redundant functions like `findOne`, `findById` from `_keystoneRunner` function. Instead, using utils functions from `server-side-graphql-client` package.
- Removed `authedGraphqlRequest` and `graphqlRequest` functions as they are redundant now.
