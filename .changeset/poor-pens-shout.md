---
'@keystone-next/keystone': major
'@keystone-next/prisma-utils': major
---

Updated Prisma package dependencies to `3.0.2`. See the [Prisma release notes](https://github.com/prisma/prisma/releases/tag/3.0.1) for full details of the changes.

Note that Keystone continues to use the "binary" query engine, rather than the new "node-API" query engine, which is now the Prisma default. We are still performing tests to ensure that the node-API query engine will work well with Keystone.
