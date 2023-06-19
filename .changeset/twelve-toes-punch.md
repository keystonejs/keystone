---
'@keystone-6/core': patch
'@keystone-6/auth': patch
---

Adds `basePath` with a default of `'/'` to `pageMiddleware` to support redirects when using `ui.basePath`
