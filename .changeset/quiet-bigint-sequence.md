---
'@keystone-6/core': patch
---

Fixes `defaultValue: { kind: 'autoincrement' }` for the `bigInt` field, previously creating an item without a value failed with a `missing value` validation error. Required `integer` and `bigInt` fields with a `defaultValue` reject an explicit `null` on create and update again, only an omitted value on create is covered by the database default
