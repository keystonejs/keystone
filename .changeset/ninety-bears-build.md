---
'@keystone-6/core': patch
---

Fixes the return type of the `resolveInput` when used as a field hook, now refined to at least the field types (but not specifically the exact field type)
