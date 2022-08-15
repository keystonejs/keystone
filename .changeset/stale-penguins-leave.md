---
'@keystone-6/core': patch
---

Fixes `extendHttpServer` not using the actual `http.Server` when using `keystone dev` - with an added limitation that it is only called once at startup.
