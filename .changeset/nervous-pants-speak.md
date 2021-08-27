---
'@keystone-next/keystone': major
---

Added the config option `graphql.omit` to list and field level configuration to control which types and operations are excluded from the GraphQL API. The use of a static `false` value in access control definitions no longer excludes operations from the GraphQL API.
