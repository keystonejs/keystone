---
'@keystone-next/adapter-prisma-legacy': patch
---

Added a `beforeExit` handler to explicitly terminate the prisma child process to avoid zombie processes when the server crashes.
