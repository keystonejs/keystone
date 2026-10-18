---
'@keystone-6/core': patch
---

Fixes `bigInt` validation bounds rejecting valid bigint configuration values at startup and not being enforced on create or update.
