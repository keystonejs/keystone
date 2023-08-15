---
'@keystone-6/core': patch
---

Fixes `ui.isAccessAllowed` when `undefined`, to prevent access to the `adminMeta` GraphQL query, akin to the behaviour for the default AdminUI `pageMiddleware`
