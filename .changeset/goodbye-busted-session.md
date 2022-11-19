---
'@keystone-6/core': major
---

Removes `createContext`, `createRequestContext` - replace any relevant usage with `.sudo`, `.withSession` or `withRequest`
