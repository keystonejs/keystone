---
'@keystone-6/core': major
---

Replace the `sudo` boolean on GraphQL schema extensions with `scope`, which is either `'public'` or `'internal'`. Code that previously checked `schema.extensions.sudo` should now check `schema.extensions.scope === 'internal'`.
