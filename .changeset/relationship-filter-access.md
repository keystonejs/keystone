---
'@keystone-6/core': minor
---

Applies `access.{operation,filter}.query.one` to relationships in unique filters and `query.many` to relationships in non-unique filters, including nested filters, mutation lookups, and cursors. The kind follows the filter input type rather than relationship cardinality or the outer operation
