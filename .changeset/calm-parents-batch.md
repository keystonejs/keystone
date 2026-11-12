---
'@keystone-6/core': patch
---

Batch compatible unpaginated to-many relationship reads across parents on the default Prisma client. Preserve the existing path for custom clients and pagination so query extensions and database limits remain effective.
