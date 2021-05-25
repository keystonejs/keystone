---
'@keystone-next/keystone': major
---

Changed the behaviour of imperative access control when querying `allItems()`. If access is denied, an empty array is returned, rather than `null`, and no `error` is returned. This makes the behaviour of imperative access control consistent with declarative access control.

Changed the behaviour of imperative access control when querying `Item()`. If access is denied, `null` is returned, rather than returning an error. This makes the behaviour of imperative access control consistent with declarative access control.
