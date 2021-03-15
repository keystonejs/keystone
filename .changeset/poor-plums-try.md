---
'@keystone-next/adapter-prisma-legacy': patch
---

Removed faulty optimisation that caused migrations to not be run if the prisma client directory and the prisma schema already existed
