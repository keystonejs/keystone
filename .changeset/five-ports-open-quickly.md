---
'@keystone-6/core': patch
---

Fixes environment variable `PORT=` precedence; `PORT=` now takes priority over the configured `server.port` 
