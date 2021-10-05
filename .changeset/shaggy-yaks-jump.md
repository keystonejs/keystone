---
'@keystone-next/keystone': major
---

Changed the default for `defaultIsFilterable` and `defaultIsOrderable` from `false` to `true`. This means that all fields are filterable and orderable by default. Filtering can be disabled by setting either `defaultIsFilterable: false` at the list level, or `isFilterable: false` at the field level. Ordering can be disabled by setting either `defaultIsOrderable: false` at the list level, or `isOrderable: false` at the field level.
