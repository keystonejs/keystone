---
'@keystone-6/core': patch
---

Fix bigInt field type to throw if `defaultValue: { kind: 'autoincrement' }` and `validation.isRequired` is set
