---
'@keystone-6/core': patch
---

Fixes `decimal` fields comparing `validation.min` and `validation.max` as strings at startup, which rejected valid bounds like `min: '2', max: '10'` and accepted a `max` smaller than `min`
