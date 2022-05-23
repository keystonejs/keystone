---
'@keystone-6/core': minor
---

Added `disconnect` to the `SessionStrategy` API, this allows Keystone to disconnect from the store when using stored sessions. This resolves the testrunner hanging when using stored sessions in automated tests.
