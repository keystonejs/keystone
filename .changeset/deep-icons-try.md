---
'@keystone-6/auth': major
'@keystone-6/core': major
---

Moves the `@keystone-6/core/session` exports to `@keystone-6/auth`. The `statelessSessions` strategy has been replaced with `jwtSessions` which uses HS256 JWTs and the `sub` claim for the authenticated item ID.
