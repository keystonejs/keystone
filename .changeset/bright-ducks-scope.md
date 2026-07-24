---
'@keystone-6/core': major
---

Changes the `sudo` boolean on GraphQL schema extensions to `scope`, which is either `'public'` or `'internal'`. Code that previously checked `schema.extensions.sudo` should now check `schema.extensions.scope === 'internal'`.
