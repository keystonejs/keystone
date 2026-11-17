---
'@keystone-6/core': patch
---

Validates and parses `cursor` arguments like unique `where` inputs so e.g. cursors with an autoincrement ID work properly. Relationship fields in cursors are now rejected with a Keystone input error instead of a Prisma error.
