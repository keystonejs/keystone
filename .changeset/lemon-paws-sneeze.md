---
'@keystone-next/auth': patch
'@keystone-next/keystone': patch
---

Readonly arrays are now accepted where previously mutable arrays were required. This means that if you use `as const` when writing an array and then pass it to various APIs in keystone, that will now work.
