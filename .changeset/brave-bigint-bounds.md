---
'@keystone-6/core': patch
---

Fixes `validation.min` and `validation.max` for the `bigInt` field, previously setting either threw an error at startup, and the bounds were never enforced. Both must now be `bigint` values
