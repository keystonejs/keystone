---
'@keystone-6/core': patch
---

Fixes `defaultValue: { kind: 'autoincrement' }` for the `bigInt` field, previously creating an item without a value failed with a `missing value` validation error
