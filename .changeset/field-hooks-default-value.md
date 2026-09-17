---
'@keystone-6/core': patch
---

Fixed field `beforeOperation` and `afterOperation` hooks not running on create or update when the field was omitted from the input but resolved to a value, such as a field `defaultValue`.
