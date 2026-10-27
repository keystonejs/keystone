---
'@keystone-6/core': minor
---

Add `access.filter.query.{one,many,count}` to filter each kind of query separately. Shared `access.filter.query` callbacks now receive `kind: 'one' | 'many' | 'count'`. This matches `access.operation.query.{one,many,count}`
