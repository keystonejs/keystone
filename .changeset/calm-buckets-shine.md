---
"@keystone-6/core": major
---

Removes the `isFilterable`, `isOrderable`, `defaultIsFilterable`, and `defaultIsOrderable` configuration options. Field read access can now distinguish between reading an item, filtering, and ordering through `access.read.item`, `access.read.filter`, and `access.read.order`. The corresponding GraphQL schema fields can be omitted through `graphql.omit.read`, with list-wide defaults configured through `fieldDefaults.access` and `fieldDefaults.graphql.omit`.
