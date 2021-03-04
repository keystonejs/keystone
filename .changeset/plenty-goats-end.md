---
'@keystone-next/access-control-legacy': major
'@keystone-next/keystone-legacy': patch
---

Updated the `validate*AccessControl` functions to take `{ access, args: ... }`. Unless you are directly calling these functions no code changes are required.
