---
'@keystone-next/keystone': major
---

Removed `resolveFields` from `context.query`, if you were still using it, you should switch to providing `the query option` to the `context.query` or you `context.db` if you were providing `false`.
