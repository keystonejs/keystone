---
'@keystonejs/server-side-graphql-client': patch
---

Fixed bug in `getItems`. Queries returning more than `pageSize` items could get stuck in an infinite loop or return incorrectly paginated data.
