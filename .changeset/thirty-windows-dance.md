---
'@keystone-next/keystone': patch
---

Added check at startup to ensure field types which defined uniqueWhere have a supported `dbField` type of `String` or `Int`.
