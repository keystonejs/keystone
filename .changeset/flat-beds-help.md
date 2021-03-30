---
'@keystone-next/keystone': major
---

Replaced `deploy`, `reset` and `generate` commands with `keystone-next prisma`. You can use these commands as replacements for the old commands:

- `keystone-next deploy` -> `keystone-next prisma migrate deploy`
- `keystone-next reset` -> `keystone-next prisma migrate reset`
- `keystone-next generate` -> `keystone-next prisma migrate dev`
