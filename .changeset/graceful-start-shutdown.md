---
'@keystone-6/core': minor
---

`keystone start` now shuts down gracefully on `SIGINT` and `SIGTERM`, it stops accepting new connections, waits for in-flight requests to complete, stops the Apollo Server and disconnects the Prisma Client before exiting. Sending a second signal exits immediately
