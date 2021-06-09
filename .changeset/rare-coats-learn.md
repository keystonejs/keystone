---
'@keystone-next/keystone': major
---

The ordering of relationships fields in the generated Prisma schema has changed so that it aligns with the order specified in the list config with the opposites to one-sided relationships added at the end. The name of one-to-one and one-to-many relationships has also changed to include `_` between the list key and field key to align with many-to-many relationships. Note that these changes do **not require a migration**, only your `schema.prisma` file will need to be updated with `keystone-next dev`/`keystone-next postinstall --fix`.
