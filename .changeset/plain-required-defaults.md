---
'@keystone-6/core': patch
---

Fixes `integer` and `bigInt` fields with a `defaultValue` and `validation.isRequired` accepting `null` on create and update, a `missing value` validation error is returned again
