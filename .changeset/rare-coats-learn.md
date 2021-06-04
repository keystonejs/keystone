---
'@keystone-next/keystone': major
---

The ordering of relationships fields in the generated Prisma schema has changed so that it aligns with the order specified in the list config with the opposites to one-sided relationships added at the end. Note that this does __NOT require a migration__, only your `schema.prisma` file will need to be updated with `keystone-next dev`/`keystone-next postinstall --fix`.
