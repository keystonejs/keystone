---
'@keystone-next/keystone': major
---

Removed the deprecated `resolveFields` from `context.query`, if you were still using it, you should switch to providing `the query option` to `context.query` or use `context.db` if you were providing `false`.
