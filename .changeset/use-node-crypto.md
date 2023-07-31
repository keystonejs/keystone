---
'@keystone-6/core': patch
'@keystone-6/auth': patch
---

Use `base64url` from `node:crypto` for random identifiers, drop `safe-uid` dependency
