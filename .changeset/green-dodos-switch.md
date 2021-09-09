---
'@keystone-next/keystone': patch
---

Fixed an issue where the incorrect value for the `operation` argument was passed into field-level access control functions. Keystone now correctly passes in `'read'` rather than the incorrect `'query'`.
