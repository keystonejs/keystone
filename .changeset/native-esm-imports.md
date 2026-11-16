---
'@keystone-6/core': major
---

Fixes default imports of external ES modules returning the module namespace rather than the default export when bundling configurations that use `"type": "module"`
