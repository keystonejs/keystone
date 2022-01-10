---
'@keystone-6/auth': patch
---

When redirecting to the homepage,  the `from` query parameter unnecessarily displayed `=/`.
This patch fixes that so it is only provided as a query parameter when needed.
