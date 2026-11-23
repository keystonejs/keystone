---
'@keystone-6/auth': major
'@keystone-6/core': major
---

Moves the `@keystone-6/core/session` exports to `@keystone-6/auth`. The `statelessSessions` strategy has been replaced with `jwtSessions` which uses HS256 JWTs and the `sub` claim for the authenticated item ID. The `SessionStore` and `SessionStoreFunction` types are now exported from `@keystone-6/auth`.

Unlike `statelessSessions`, which encrypted the session, `jwtSessions` only signs it: the session payload can be read by anyone holding the cookie, so only store data that is safe for the client to see, or use `storedSessions`. If you need encrypted sessions, you can use a different session implementation.
