---
'@keystone-next/keystone': major
---

The `id` field on the item returned from `context.db.lists` functions/passed to hooks/field type resolvers is now whatever the actual id field returned from Prisma is rather than a stringified version of it.
