---
'@keystone-6/core': patch
---

Fixes negated equality filters on nullable `bytes` fields so they include items with null values.
