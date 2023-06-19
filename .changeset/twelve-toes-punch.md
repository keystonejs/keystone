---
'@keystone-6/core': patch
'@keystone-6/auth': patch
---

Adds `basePath` with a default of `'/'` to `pageMiddleware` args to help with redirecting when using `ui.basePath`
