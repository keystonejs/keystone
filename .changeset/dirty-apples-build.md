---
'@keystone-6/core': patch
---

The Prisma binaries are now downloaded just before they're needed if the Prisma's install script to download them fails. Note this will never happen in production, they will always be downloaded before.
