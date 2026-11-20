---
'@keystone-6/core': patch
---

Fixes `connect`, `disconnect` and `set` in relationship inputs failing with a Prisma error when the unique `where` used a 1-to-1 relationship
