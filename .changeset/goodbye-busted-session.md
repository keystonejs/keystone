---
'@keystone-6/core': major
---

Removes `createContext`, `createRequestContext` - replace any relevant usage with `context.sudo()`, `context.withSession()` or `context.withRequest()`
