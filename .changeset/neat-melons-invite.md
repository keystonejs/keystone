---
'@keystone-next/keystone': patch
---

Field-level `validateUpdate`, `validateDelete` and `resolveInput` hooks and field-level create and update access control functions are now awaited in parallel. 
