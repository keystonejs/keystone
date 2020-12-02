---
'@keystone-next/keystone': major
'@keystone-next/types': major
---

Changed the type `SessionContext` to have parameters `startSession` and `endSession` as required. This type also takes a type parameter `T` which corresponds to the data type of the `data` argument to `startSession`.
