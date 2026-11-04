---
'@keystone-6/core': major
'@keystone-6/auth': minor
---

Moves `password` field from `@keystone-6/core/fields` to `@keystone-6/auth`. Removes `validation.rejectCommon`, use a validate hook instead.
