---
'@keystone-6/auth': major
'@keystone-6/core': major
---

Replaces Node.js HTTP `context.req` and `context.res` on `KeystoneContext` with WHATWG `Headers` on `context.req` and `context.res`. Use `context.withHeaders(req, res?)` to create a request-bound context.

