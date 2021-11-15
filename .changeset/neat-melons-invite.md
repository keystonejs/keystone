---
'@keystone-next/keystone': patch
---

Field-level hooks and field-level create and update access control functions are now awaited in parallel. Note this means all field-level hooks and access control are now awaited in parallel because field-level read access control was already awaited in parallel.
