---
'@keystone-next/keystone': major
---

Removed the deprecated `resolveFields` from `context.query`, if you were still using it, you should switch to providing `the query option` to `context.query` or use `context.db` if you were providing `false`. The `context.query` functions will now also throw an error if an empty string is passed to `query` rather than silently returning what the `context.db` functions return, you must select at least one field or omit the `query` option to default to selecting the `id`.
