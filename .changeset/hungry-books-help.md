---
'@keystone-next/keystone': patch
---

Fixed negative `take` values above the list's `graphql.queryLimits.maxResults` not causing an error before getting the values from the database.
