---
'@keystone-next/keystone': minor
---

Added support for dynamic `isFilterable` and `isOrderable` field config values. If a function is provided for these config option, it will be dynamically evaluated each time the field is used for filtering and ordering, and an error will be returned if the function returns `false`.
