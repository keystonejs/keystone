---
"@keystone-6/core": patch
---

Fixes `decimal` field bug (#8597) by parsing to `Decimal` before lessThan / greaterThan checks
